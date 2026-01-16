'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  isStaticToolUIPart,
  getStaticToolName,
} from 'ai';
import { useState } from 'react';

export default function Chat() {
  const { messages, addToolOutput, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map(m => (
          <div key={m.id} className="mb-4">
            <strong className="text-lg">{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              if (part.type === 'text') {
                return <div key={i} className="text-gray-700 ml-2">{part.text}</div>;
              }
              if (isStaticToolUIPart(part)) {
                const toolName = getStaticToolName(part);
                const toolCallId = part.toolCallId;

                // render confirmation tool (client-side tool with user interaction)
                if (
                  toolName === 'getWeatherInformation' &&
                  part.state === 'input-available'
                ) {
                  const input = part.input as { city: string };
                  return (
                    <div key={toolCallId} className="bg-blue-50 border border-blue-200 rounded p-4 mt-2 ml-2">
                      <p className="text-blue-900 mb-3">
                        Get weather information for <strong>{input.city}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await addToolOutput({
                              toolCallId,
                              tool: toolName,
                              output: 'Yes, confirmed.',
                            });
                            sendMessage();
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                          Yes
                        </button>
                        <button
                          onClick={async () => {
                            await addToolOutput({
                              toolCallId,
                              tool: toolName,
                              output: 'No, denied.',
                            });
                            sendMessage();
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                }

                // Display tool result
                if (
                  toolName === 'getWeatherInformation' &&
                  part.state === 'output-available'
                ) {
                  return (
                    <div key={toolCallId} className="bg-gray-100 rounded p-3 mt-2 ml-2 text-gray-700">
                      <strong>Tool Result:</strong> {String(part.output)}
                    </div>
                  );
                }
              }
            })}
            <br />
          </div>
        ))}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="border-t border-gray-300 p-4 bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            value={input}
            placeholder="Say something..."
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}