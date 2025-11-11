# Gemini 2.5 Chat Application with AI SDK

This is a Next.js application demonstrating how to build a chat interface with Google's Gemini 2.5 AI model using the [Vercel AI SDK](https://ai-sdk.dev/).

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm, npm, or yarn
- Google API key for Gemini API

### 1. Get Your Google API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key" or "Create new secret key"
3. Copy your API key

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

You can copy from `.env.local.example` and add your key.

### 3. Install Dependencies

```bash
pnpm install
# or: npm install / yarn install
```

### 4. Run Development Server

```bash
pnpm dev
# or: npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the chat interface.

## Project Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts        # Backend API route for chat streaming
├── components/
│   └── ChatInterface.tsx    # Main chat UI component
├── layout.tsx              # Root layout with metadata
├── page.tsx                # Home page
└── globals.css             # Global styles with Tailwind
```

## Key Features

- ✨ **Streaming Responses**: Real-time message streaming from Gemini 2.5
- 💬 **Chat Interface**: Modern, clean chat UI with message history
- ⚡ **AI SDK Integration**: Uses official Vercel AI SDK for seamless model integration
- 🎨 **Tailwind CSS**: Beautiful, responsive design
- 📱 **Mobile Friendly**: Works on desktop and mobile devices
- 🔧 **TypeScript**: Fully typed for better development experience

## How It Works

### Frontend Flow
1. User types a message in the input field
2. `ChatInterface` component uses the `useChat` hook from `ai/react`
3. Message is sent to `/api/chat` endpoint
4. Responses stream in real-time and update the UI

### Backend Flow
1. API route receives messages from the frontend
2. `streamText` function from AI SDK processes the request
3. Gemini 2.5 model generates responses
4. Responses are streamed back to the client as data

## Technology Stack

- **Next.js 16**: React framework
- **AI SDK**: Official SDK for AI model integration
- **@ai-sdk/google**: Google's AI model provider for the AI SDK
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **React 19**: Latest React version

## API Reference

### POST `/api/chat`

Streams chat completions from Gemini 2.5.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ]
}
```

**Response:**
Server-sent events stream with text chunks

## Customization

### Change the AI Model

In `app/api/chat/route.ts`, modify the model:

```typescript
// Use a different Gemini model
model: google('gemini-2.5-pro'),  // or 'gemini-1.5-flash', etc.
```

### Customize System Prompt

Update the system message in the API route:

```typescript
system: 'Your custom system prompt here...',
```

### Styling

The chat interface uses Tailwind CSS. Modify colors and styles in:
- `app/components/ChatInterface.tsx` - Component styles
- `app/globals.css` - Global styles

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google API key for Gemini API |

## Troubleshooting

### API Key Error
- Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Verify the key is valid at [Google AI Studio](https://aistudio.google.com/apikey)

### Messages Not Sending
- Check browser console for errors
- Verify the API route is accessible at `/api/chat`
- Ensure all dependencies are installed: `pnpm install`

### Streaming Not Working
- Make sure you're using `streamText` (not `generateText`)
- Verify the API route has `export const runtime = 'nodejs'`

## Learn More

- [AI SDK Documentation](https://ai-sdk.dev/)
- [Gemini 2.5 Guide](https://ai-sdk.dev/cookbook/guides/gemini-2-5)
- [Google Generative AI API Docs](https://ai.google.dev/api)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT

