# Claude 4 Chat Application

This is a [Next.js](https://nextjs.org) application that demonstrates how to integrate Claude 4 with the [AI SDK](https://ai-sdk.dev/). It provides a real-time chat interface powered by Anthropic's Claude 3.5 Sonnet model.

## Features

- 🚀 Real-time streaming responses from Claude 4
- 💬 Full conversation history with message display
- 🧠 Support for Claude's extended thinking with reasoning display
- 🎨 Clean, responsive UI with Tailwind CSS
- 🌙 Dark mode ready
- ⚡ Server-side streaming for optimal performance

## Prerequisites

- Node.js 18+ and pnpm
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)

## Installation & Setup

### 1. Install Dependencies

All required dependencies have been installed:
- `ai` - AI SDK core library
- `@ai-sdk/anthropic` - Anthropic provider for AI SDK  
- `@ai-sdk/react` - React hooks and utilities for AI SDK

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Replace `your_anthropic_api_key_here` with your actual API key from Anthropic Console.

### 3. Run the Development Server

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the chat application.

## Project Structure

```
app/
├── page.tsx           # Main chat interface with useChat hook
├── api/
│   └── chat/
│       └── route.ts   # API endpoint for streaming chat responses
├── layout.tsx         # Root layout
└── globals.css        # Global styles
```

## How It Works

### Frontend (`app/page.tsx`)
- Uses the `useChat` hook from `@ai-sdk/react`
- Manages conversation state and message history
- Displays messages with role-based styling
- Shows Claude's extended thinking/reasoning when available
- Handles real-time streaming updates

### Backend (`app/api/chat/route.ts`)
- Receives messages from the frontend
- Uses `streamText` from the AI SDK to stream responses
- Integrates with Anthropic's Claude 3.5 Sonnet model
- Returns streamed responses for real-time display

## Building & Deployment

Build for production:

```bash
pnpm build
pnpm start
```

## Learn More

To learn more about this integration and Next.js, check out these resources:

- [AI SDK Documentation](https://ai-sdk.dev/)
- [Claude 4 Integration Guide](https://ai-sdk.dev/cookbook/guides/claude-4)
- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Vercel AI SDK GitHub](https://github.com/vercel/ai)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deployment Steps:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on Vercel
3. Add your `ANTHROPIC_API_KEY` as an environment variable in Vercel settings
4. Deploy!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

