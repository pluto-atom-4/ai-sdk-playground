import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Use the Node.js runtime instead of Edge to ensure environment variables are loaded correctly.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Basic request logging for debugging
    console.log('/api/chat POST called');

    const payload = await req.json();
    const { messages }: { messages: UIMessage[] } = payload || {};
    console.log('/api/chat received messages count:', Array.isArray(messages) ? messages.length : 'invalid');

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First try the library helper to build model messages
    let modelMessages: any = convertToModelMessages(messages);

    // If convertToModelMessages produced no usable content, fall back to a simple mapping
    const hasContent = Array.isArray(modelMessages) && modelMessages.some((m: any) => {
      if (!m) return false;
      if (typeof m.content === 'string') return m.content.trim().length > 0;
      if (Array.isArray(m.content)) return m.content.some((c: any) => typeof c === 'string' ? c.trim().length > 0 : !!c);
      return !!m.content;
    });

    if (!hasContent) {
      console.warn('/api/chat: convertToModelMessages returned no content; falling back to manual mapping');
      modelMessages = messages.map(m => ({
        role: m.role,
        content: m.parts.map(p => ({ type: 'text', text: (p as any).text || JSON.stringify(p) })),
      }));
    }

    // DEBUG: log the model messages being sent to the model
    try {
      console.log('/api/chat modelMessages:', JSON.stringify(modelMessages));
    } catch (e) {
      console.log('/api/chat modelMessages (stringify failed)', modelMessages);
    }

    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      system: 'You are a helpful assistant.',
      messages: modelMessages,
    });

    // Defensive check: ensure streamText returned an object with the expected helper
    if (!result || typeof (result as any).toUIMessageStreamResponse !== 'function') {
      console.error('streamText returned an unexpected value:', result);
      return new Response(JSON.stringify({ error: 'Streaming not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('/api/chat returning stream response');
    return (result as any).toUIMessageStreamResponse();
  } catch (err) {
    // Basic error handling so the client receives a proper error instead of hanging
    console.error('Error in /api/chat route:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}