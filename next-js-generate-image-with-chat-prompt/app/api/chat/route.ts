import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';

import { generateImage } from '@/tools/generate-image';

const tools = {
  generateImage,
};

export type ChatTools = InferUITools<typeof tools>;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}