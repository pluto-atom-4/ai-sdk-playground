'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import type { ChatMessage } from './api/chat/route';
import { useTheme } from './ThemeProvider';
import styles from './page.module.css';

export default function Page() {
  const [input, setInput] = useState('');
  const { theme, toggleTheme } = useTheme();

  const { messages, sendMessage } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const themeClass = theme === 'dark' ? styles.darkMode : styles.lightMode;

  return (
    <div className={`${styles.page} ${themeClass}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chat Interface</h1>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className={styles.themeIcon}>
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </header>

      <div className={styles.container}>
        <div className={styles.chatArea}>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Your Message</label>
            <input
              className={styles.input}
              placeholder="Type your message and press Enter..."
              value={input}
              onChange={event => {
                setInput(event.target.value);
              }}
              onKeyDown={async event => {
                if (event.key === 'Enter' && input.trim()) {
                  sendMessage({
                    text: input,
                  });
                  setInput('');
                }
              }}
            />
          </div>

          <div className={styles.messagesWrapper}>
            {messages.length === 0 ? (
              <div className={styles.noMessages}>
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index}>
                  {message.parts.map(part => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            key={`${message.id}-text`}
                            className={`${styles.message} ${styles.messageAssistant}`}
                          >
                            {part.text}
                          </div>
                        );
                      case 'tool-getWeather':
                        return (
                          <div
                            key={`${message.id}-weather`}
                            className={`${styles.message} ${styles.toolResult}`}
                          >
                            <strong>Weather Data:</strong>
                            <pre>{JSON.stringify(part, null, 2)}</pre>
                          </div>
                        );
                    }
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}