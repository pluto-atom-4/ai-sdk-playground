import { openai } from '@ai-sdk/openai';
import { ModelMessage, streamText } from 'ai';
import readline from 'readline';

// Initialize readline for terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Store messages history
let messages: ModelMessage[] = [];

// Main function to run the chatbot
async function main() {
  rl.question("You: ", async (userInput) => {
    messages.push({ role: "user", content: userInput }); // Add user input to message history

    const result = await streamText({ model: openai, messages });

    result.textStream.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    result.textStream.on('end', () => {
      rl.close(); // End readline when done
    });

    messages.push({ role: "assistant", content: result }); // Store assistant's response
  });
}

// Start the chatbot
main();
