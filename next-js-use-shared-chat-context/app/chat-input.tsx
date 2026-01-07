'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { useSharedChatContext } from './chat-context';
import styles from './chat-input.module.css';

export default function ChatInput() {
  const { chat } = useSharedChatContext();
  const [text, setText] = useState('');
  const { status, stop, sendMessage } = useChat({ chat });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    sendMessage({ text });
    setText('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>Message</label>
        <input
          className={styles.input}
          placeholder="Say something..."
          disabled={status !== 'ready'}
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Chat message input"
        />
      </div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.sendButton}
          type="submit"
          disabled={status !== 'ready' || text.trim() === ''}
          aria-label="Send message"
        >
          Send
        </button>
        {status === 'streaming' || status === 'submitted' ? (
          <button
            className={styles.stopButton}
            type="button"
            onClick={stop}
            aria-label="Stop streaming"
          >
            Stop
          </button>
        ) : null}
      </div>
    </form>
  );
}