import { anthropic } from '@ai-sdk/anthropic';
import { CoreMessage, streamText } from 'ai';
import readline from 'readline';
import { e2bTools, cleanupSandbox } from './lib/e2b/tools';
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
          model: anthropic('claude-3-5-sonnet-20241022', {
            cacheControl: true,
          }),
          messages,
          tools: e2bTools,
          maxSteps: 10,
        });

        process.stdout.write('\nAssistant: ');
        let fullResponse = '';

        // Handle streaming response
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            process.stdout.write(part.textDelta);
            fullResponse += part.textDelta;
          } else if (part.type === 'tool-call') {
            console.log(`\n[Tool Call: ${part.toolName}]`);
          } else if (part.type === 'tool-result') {
            console.log(`[Tool Result: ${JSON.stringify(part.result).substring(0, 100)}...]`);
          }
        }

        console.log('\n');

        // Get the final text and tool calls
        const { text, toolCalls, toolResults } = await result;

        // Add assistant's response to message history
        messages.push({
          role: 'assistant',
          content: [
            { type: 'text', text: text },
            ...toolCalls.map(tc => ({
              type: 'tool-call' as const,
              toolCallId: tc.toolCallId,
              toolName: tc.toolName,
              args: tc.args,
            })),
          ],
        });

        // Add tool results if any
        if (toolResults.length > 0) {
          messages.push({
            role: 'tool',
            content: toolResults.map(tr => ({
              type: 'tool-result' as const,
              toolCallId: tr.toolCallId,
              toolName: tr.toolName,
              result: tr.result,
            })),
          });
        }

      } catch (error) {
        console.error('\nError:', error instanceof Error ? error.message : String(error));
      }

      // Ask next question
      askQuestion();
    });
  };

  askQuestion();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\nCleaning up...');
  await cleanupSandbox();
  process.exit(0);
});

// Start the chatbot
main();
