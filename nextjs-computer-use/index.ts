import { anthropic } from '@ai-sdk/anthropic';
import { CoreMessage, streamText } from 'ai';
import readline from 'readline';
import { e2bTools, toolExecutors, cleanupSandbox } from './lib/e2b/tools';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize readline for terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Store messages history
const messages: CoreMessage[] = [];

// Main function to run the chatbot
async function main() {
  console.log('Computer Use Chatbot (Anthropic + E2B)');
  console.log('Type your message and press Enter. The AI can execute code in a sandbox.\n');

  const askQuestion = () => {
    rl.question("You: ", async (userInput) => {
      if (!userInput.trim()) {
        askQuestion();
        return;
      }

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log('Goodbye!');
        await cleanupSandbox();
        rl.close();
        process.exit(0);
        return;
      }

      messages.push({ role: "user", content: userInput });

      try {
        const result = streamText({
          model: anthropic("claude-sonnet-4-5"),
          messages,
          // tools: Object.values(e2bTools), // Temporarily disabled
        });

        process.stdout.write('\nAssistant: ');

        // Handle streaming response
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            process.stdout.write(part.text);
          } else if (part.type === 'tool-call') {
            console.log(`\n[Tool Call: ${part.toolName}]`);

            // Execute the tool manually
            const toolName = part.toolName;
            const args = part.input;

            let toolResult;
            switch (toolName) {
              case 'executeCode':
                toolResult = await toolExecutors.executeCode(args as any);
                break;
              case 'writeFile':
                toolResult = await toolExecutors.writeFile(args as any);
                break;
              case 'readFile':
                toolResult = await toolExecutors.readFile(args as any);
                break;
              case 'listFiles':
                toolResult = await toolExecutors.listFiles(args as any);
                break;
              default:
                toolResult = { error: `Unknown tool: ${toolName}` };
            }

            console.log(`[Tool Result: ${JSON.stringify(toolResult).substring(0, 100)}...]`);
          }
        }

        console.log('\n');

        // Get the final response
        const finalResult = await result;

        // Add assistant's response to message history
        messages.push({
          role: 'assistant',
          content: await finalResult.text,
        });

      } catch (error) {
        console.error('\nError:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await cleanupSandbox();
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  await cleanupSandbox();
  rl.close();
  process.exit(0);
});

// Start the chatbot
main().catch(console.error);
