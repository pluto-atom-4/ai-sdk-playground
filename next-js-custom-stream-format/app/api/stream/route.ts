import { tools } from '@/ai/tools'; // your tools
import { stepCountIs, streamText } from 'ai';

export type StreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolName: string; input: unknown }
  | { type: 'tool-result'; toolName: string; result: unknown };

const encoder = new TextEncoder();

function formatEvent(event: StreamEvent): Uint8Array {
  return encoder.encode('data: ' + JSON.stringify(event) + '\n\n');
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = streamText({
    prompt,
    model: "anthropic/claude-sonnet-4.5",
    tools,
    stopWhen: stepCountIs(5),
  });

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      switch (chunk.type) {
        case 'text-delta':
          controller.enqueue(formatEvent({ type: 'text', text: chunk.text }));
          break;
        case 'tool-call':
          controller.enqueue(
            formatEvent({
              type: 'tool-call',
              toolName: chunk.toolName,
              input: chunk.input,
            }),
          );
          break;
        case 'tool-result':
          controller.enqueue(
            formatEvent({
              type: 'tool-result',
              toolName: chunk.toolName,
              result: chunk.output,
            }),
          );
          break;
      }
    },
  });

  return new Response(result.fullStream.pipeThrough(transformStream), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}