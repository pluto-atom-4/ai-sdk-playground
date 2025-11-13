import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert messages to ModelMessage format for the AI SDK
  const modelMessages = convertToModelMessages(messages);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: modelMessages,
    system: 'You are a helpful AI assistant powered by Gemini 2.5.',
  });

  // Create a proper data stream that useChat can consume
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.textStream) {
        // Format as data stream protocol: "0:" prefix for text chunks
        controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

