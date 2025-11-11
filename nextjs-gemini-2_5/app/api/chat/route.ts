import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages,
    system: 'You are a helpful AI assistant powered by Gemini 2.5.',
  });

  return result.toDataStreamResponse();
}

