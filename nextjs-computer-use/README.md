# Computer Use Chatbot with Anthropic & E2B

This project demonstrates how to build a computer use chatbot using Anthropic's Claude with the AI SDK and E2B code execution sandbox.

## Features

- 🤖 **Anthropic Claude Integration**: Uses Claude 3.5 Sonnet for intelligent responses
- 💻 **Code Execution**: Executes JavaScript code in a secure E2B sandbox
- 🔄 **Streaming Responses**: Real-time streaming of AI responses
- 💬 **Conversational Memory**: Maintains conversation context across multiple interactions
- 🛠️ **Tool Use**: Automatically calls code execution tools when needed

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create or update your `.env` file with the following:

```env
# Anthropic API Key (required for Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# E2B API Key (required for code execution sandbox)
E2B_API_KEY=your_e2b_api_key_here
```

#### Getting API Keys:

- **Anthropic API Key**: Get it from [https://console.anthropic.com/](https://console.anthropic.com/)
- **E2B API Key**: Get it from [https://e2b.dev/](https://e2b.dev/)

### 3. Run the Chatbot

```bash
pnpm tsx index.ts
```

## Usage

Once running, you can:

1. Type your message and press Enter
2. The AI can execute code in the sandbox when needed
3. Type `exit` or `quit` to end the session

### Example Interactions

```
You: Calculate the fibonacci sequence up to 10 numbers
[Tool Call: computer]
[Tool Result: {"success":true,"results":[0,1,1,2,3,5,8,13,21,34]}]
Assistant: Here are the first 10 Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

You: Create a simple plot of these numbers
[Tool Call: computer]
Assistant: I've created a visualization of the Fibonacci sequence...
```

## Next.js Development

This is also a [Next.js](https://nextjs.org) project. To run the web interface:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK Computer Use Guide](https://ai-sdk.dev/cookbook/guides/computer-use)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [E2B Code Interpreter](https://e2b.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
