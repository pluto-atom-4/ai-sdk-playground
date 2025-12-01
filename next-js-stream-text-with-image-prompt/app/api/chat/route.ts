import { convertToModelMessages, type InferUITools, stepCountIs, streamText, type UIMessage } from "ai";

import { openai } from "@ai-sdk/openai";

import { generateImage} from "@/tools/generate-image";

const tools = {
    generateImage,
};

export type ChatTools = InferUITools<typeof tools>;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing OPENAI_API_KEY. Set the OPENAI_API_KEY environment variable for local development.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages }: {messages: UIMessage[]} = await request.json();

  const result = streamText({
    model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
    system: 'You are a helpful assistant that provides concise answers.',
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}