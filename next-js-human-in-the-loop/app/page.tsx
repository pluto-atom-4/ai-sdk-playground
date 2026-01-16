'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  isStaticToolUIPart,
  getStaticToolName,
} from 'ai';
import { useState } from 'react';
import { useTheme } from './providers/ThemeProvider';
import styles from './page.module.css';

export default function Chat() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { messages, addToolOutput, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');

  return (
    <div className={styles.chatContainer}>
      {/* Header with theme toggle */}
      <div className={`${styles.headerContainer} ${isDark ? styles.darkHeaderBorder : styles.lightHeaderBorder}`}>
        <h1 className={styles.title}>AI Chat</h1>
        <button
          onClick={toggleTheme}
          className={styles.themeToggleButton}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Messages container */}
      <div className={styles.messagesContainer}>
        {messages?.map(m => (
          <div key={m.id} className={styles.message}>
            <strong className={styles.messageRole}>{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              if (part.type === 'text') {
                return <div key={i} className={isDark ? styles.darkText : styles.lightText}>{part.text}</div>;
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
                    <div key={toolCallId} className={`${styles.toolConfirmation} ${isDark ? styles.darkConfirmation : styles.lightConfirmation}`}>
                      <p className={styles.confirmationText}>
                        Get weather information for <strong>{input.city}</strong>?
                      </p>
                      <div className={styles.buttonGroup}>
                        <button
                          onClick={async () => {
                            await addToolOutput({
                              toolCallId,
                              tool: toolName,
                              output: 'Yes, confirmed.',
                            });
                            sendMessage();
                          }}
                          className={`${styles.button} ${styles.confirmButton}`}
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
                          className={`${styles.button} ${styles.denyButton}`}
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
                    <div key={toolCallId} className={`${styles.toolResult} ${isDark ? styles.darkResult : styles.lightResult}`}>
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

      {/* Input form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className={`${styles.formContainer} ${isDark ? styles.darkBorder : styles.lightBorder}`}
      >
        <div className={styles.inputGroup}>
          <input
            value={input}
            placeholder="Say something..."
            onChange={e => setInput(e.target.value)}
            className={`${styles.input} ${isDark ? styles.darkInput : styles.lightInput}`}
          />
          <button
            type="submit"
            className={styles.sendButton}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}