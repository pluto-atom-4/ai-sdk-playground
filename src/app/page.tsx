'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  // Debug: log messages to help diagnose why responses aren't shown
  useEffect(() => {
    console.log('useChat messages update:', messages);
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            // Render known text parts, otherwise fallback to text or a JSON dump
            if (part.type === 'text') {
              return (
                <div key={`${message.id}-${i}`}>{part.text}</div>
              );
            }

            // Fallback rendering for unknown part types (helps when streamed deltas come in)
            return (
              <div key={`${message.id}-${i}`}>
                {part && typeof part === 'object' ? JSON.stringify(part) : String(part)}
              </div>
            );
          })}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}