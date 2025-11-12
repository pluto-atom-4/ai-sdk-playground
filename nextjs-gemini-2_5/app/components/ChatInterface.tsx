'use client';

import { useChat } from '@ai-sdk/react';
import { CoreMessage } from 'ai';
import { useState } from 'react';
import React from 'react';

// Helper function to safely extract message content
function getMessageContent(message: unknown): string {
  console.log('Processing message:', message);

  if (typeof message === 'string') {
    console.log('Message is string:', message);
    return message;
  }

  const msg = message as Record<string, unknown>;

  // Check for content property (standard format from useChat)
  if (typeof msg.content === 'string') {
    console.log('Message has content string:', msg.content);
    return msg.content;
  }

  // If content is an array (for tool calls, etc.)
  if (Array.isArray(msg.content)) {
    console.log('Message has content array:', msg.content);
    return msg.content
      .map((item: unknown) => {
        if (typeof item === 'string') return item;
        const i = item as Record<string, unknown>;
        if (i.type === 'text') return typeof i.text === 'string' ? i.text : '';
        return '';
      })
      .filter(Boolean)
      .join('');
  }

  // Fallback for other structures
  console.log('Message structure:', JSON.stringify(message));
  return JSON.stringify(message);
}

export function ChatInterface() {
  const { messages, append, status, error } = useChat({
    maxSteps: 5,
  });
  const [input, setInput] = useState('');
  // isLoading is true when status is anything other than 'ready' (e.g., 'submitted', streaming, etc.)
  const isLoading = status !== 'ready';

  // Debug logging
  React.useEffect(() => {
    console.log('Messages:', messages);
    console.log('Status:', status);
    if (error) console.error('Error:', error);
  }, [messages, status, error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Appending message:', input);
    console.log('Current messages before append:', messages);

    const message: CoreMessage = {
      content: input,
      role: 'user',
    };
    await append(message);
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Gemini 2.5 Chat</h1>
        <p className="text-blue-100 mt-2">
          Powered by Google AI SDK
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">
                Start a conversation with Gemini 2.5
              </p>
              <p className="text-sm">
                Ask anything and get instant responses powered by the latest
                Google AI model
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          console.log('Rendering message:', message);
          return (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">
                {getMessageContent(message)}
              </p>
            </div>
          </div>
        );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          💡 Tip: Make sure to set the GOOGLE_GENERATIVE_AI_API_KEY environment
          variable
        </p>
      </div>
    </div>
  );
}

