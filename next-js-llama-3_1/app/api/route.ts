import { deepinfra } from '@ai-sdk/deepinfra';
import { convertToModelMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepinfra('meta-llama/Meta-Llama-3.1-70B-Instruct'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}