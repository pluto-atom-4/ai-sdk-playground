import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { prompt }: {prompt: string} = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: 'You are a helpful assistant that provides concise answers.',
    prompt,
  });

  return result.toUIMessageStreamResponse();
}