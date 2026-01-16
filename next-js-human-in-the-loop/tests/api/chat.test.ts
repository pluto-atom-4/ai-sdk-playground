/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest';

// Mock the 'ai' module functions used by the route handler
vi.mock('ai', async () => {
  return {
    createUIMessageStreamResponse: ({ stream }: any) => {
      // Return a minimal Response-like object used by the handler
      return new Response('ok', { status: 200, headers: { 'content-type': 'text/event-stream' } });
    },
    createUIMessageStream: () => {
      return {
        toUIMessageStream: () => ({ data: 'mock' }),
      };
    },
    streamText: () => ({
      toUIMessageStream: () => ({ data: 'mock' }),
    }),
    tool: () => ({}),
    convertToModelMessages: async (m: any) => m,
    stepCountIs: () => () => true,
  } as any;
});

// Mock openai
vi.mock('@ai-sdk/openai', () => ({ openai: () => ({ /*noop*/ }) }));

// Import the POST handler after mocks
import { POST } from '../../app/api/chat/route';

describe('POST /api/chat handler', () => {
  it('returns 200 response and event-stream content-type', async () => {
    const body = JSON.stringify({ messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] }] });

    const req = new Request('http://localhost/api/chat', { method: 'POST', body, headers: { 'content-type': 'application/json' } });

    const res = await POST(req as any);

    expect(res).toBeDefined();
    expect((res as Response).status).toBe(200);
    expect((res as Response).headers.get('content-type')).toContain('text/event-stream');
  });
});
