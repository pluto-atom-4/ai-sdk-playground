import { anthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages: convertToModelMessages(messages),
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 15000 },
      } satisfies AnthropicProviderOptions,
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}