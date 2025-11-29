'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import Image from 'next/image';
import { type FormEvent, useState } from 'react';
import type { ChatTools } from './api/chat/route';

type ChatMessage = UIMessage<never, never, ChatTools>;

export default function Chat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sendMessage({
      parts: [{ type: 'text', text: input }],
    });

    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            <div key={message.id}>
              <div className="font-bold">{message.role}</div>
              {message.parts.map((part, partIndex) => {
                const { type } = part;

                if (type === 'text') {
                  return (
                    <div key={`${message.id}-part-${partIndex}`}>
                      {part.text}
                    </div>
                  );
                }

                if (type === 'tool-generateImage') {
                  const { state, toolCallId } = part;

                  if (state === 'input-available') {
                    return (
                      <div key={`${message.id}-part-${partIndex}`}>
                        Generating image...
                      </div>
                    );
                  }

                  if (state === 'output-available') {
                    const { input, output } = part;

                    return (
                      <Image
                        key={toolCallId}
                        src={`data:image/png;base64,${output.image}`}
                        alt={input.prompt}
                        height={400}
                        width={400}
                      />
                    );
                  }
                }
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}