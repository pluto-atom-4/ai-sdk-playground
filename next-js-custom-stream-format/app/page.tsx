'use client';

import { useState } from 'react';
import { StreamEvent } from './api/stream/route';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async () => {
    setEvents([]);
    setIsStreaming(true);
    setPrompt('');

    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            const dataStr = line.replace(/^data: /, '');
            const event = JSON.parse(dataStr) as StreamEvent;
            setEvents(prev => [...prev, event]);
          }
        }
      }
    }

    setIsStreaming(false);
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter a prompt..."
      />
      <button onClick={handleSubmit} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Send'}
      </button>

      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}