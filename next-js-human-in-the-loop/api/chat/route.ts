import { openai } from "@ai-sdk/openai";
import {
  createUIMessageStreamResponse,
  createUIMessageStream,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai('gpt-4o'),
        messages: await convertToModelMessages(messages),
        tools: {
          getWeatherInformation: tool({
            description: 'show the weather in a given city to the user',
            inputSchema: z.object({ city: z.string() }),
            outputSchema: z.string(),
            // execute function removed to stop automatic execution
          }),
        },
        stopWhen: stepCountIs(5),
      });

      writer.merge(result.toUIMessageStream({ originalMessages: messages })); // pass in original messages to avoid duplicate assistant messages
    },
  });

  return createUIMessageStreamResponse({ stream });
}