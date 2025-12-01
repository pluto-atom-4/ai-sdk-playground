import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages }: {messages: UIMessage[]} = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: 'You are a helpful assistant that provides concise answers.',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}