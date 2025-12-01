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

  let messages: UIMessage[];
  try {
    const body = await request.json();
    messages = body.messages;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[API] Received request with", messages.length, "messages");
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Error parsing request:", err);
    }
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Trim message history to prevent context window overflow.
  // Keep only the most recent 10 messages to stay well within GPT-4o's context limit.
  const MAX_MESSAGES = 10;
  const trimmedMessages = messages.length > MAX_MESSAGES
    ? messages.slice(messages.length - MAX_MESSAGES)
    : messages;

  if (process.env.NODE_ENV === "development") {
    console.log("[API] Using", trimmedMessages.length, "trimmed messages");
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: 'You are a helpful assistant that provides concise answers.',
    messages: convertToModelMessages(trimmedMessages),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}