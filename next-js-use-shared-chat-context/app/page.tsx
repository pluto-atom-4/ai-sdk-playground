'use client';

import { useChat } from '@ai-sdk/react';
import { useSharedChatContext } from './chat-context';
import { useTheme } from './theme-context';
import ChatInput from './chat-input';
import styles from './page.module.css';
import commonStyles from './common.module.css';

export default function Chat() {
  const { chat, clearChat } = useSharedChatContext();
  const { messages } = useChat({
    chat,
  });
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.chatPage}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Chat</h1>
        <div className={styles.controls}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            suppressHydrationWarning
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button
            className={commonStyles.buttonDanger}
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            Clear Chat
          </button>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.messagesEmpty}>
            Start a conversation...
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? commonStyles.messageUser
                  : commonStyles.messageAssistant
              }
            >
              <strong>{`${message.role.toUpperCase()}: `}</strong>
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return <div key={index}>{part.text}</div>;
                }
              })}
            </div>
          ))
        )}
      </div>

      <div className={styles.inputContainer}>
        <ChatInput />
      </div>
    </div>
  );
}