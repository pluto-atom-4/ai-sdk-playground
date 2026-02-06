import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

// In-memory storage for messages per session
const messageStore = new Map<string, UIMessage[]>();

/**
 * Load messages for a given session ID
 * @param id - Session ID
 * @returns Array of messages for the session, or empty array if session doesn't exist
 */
async function loadMessages(id: string): Promise<UIMessage[]> {
  return messageStore.get(id) ?? [];
}

/**
 * Save messages for a given session ID
 * @param id - Session ID
 * @param messages - Array of messages to save
 */
async function saveMessages(id: string, messages: UIMessage[]): Promise<void> {
  messageStore.set(id, messages);
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, message } = await req.json();

  // Load existing messages and add the new one
  const messages = await loadMessages(id);
  messages.push(message);

  // Call the language model
  const result = streamText({
    model: openai('gpt-4.1'),
    messages: await convertToModelMessages(messages),
  });

  // Respond with the stream
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages: newMessages }) => {
      saveMessages(id, newMessages);
    },
  });
}