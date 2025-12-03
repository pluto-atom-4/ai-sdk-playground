'use client';

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import styles from './page.module.css';

type ConvertedFile = {
  type: 'file';
  filename: string;
  mediaType: string;
  url: string;
};

async function convertFilesToDataURLs(files: FileList): Promise<ConvertedFile[]> {
  return Promise.all(
    Array.from(files).map(
      file =>
        new Promise<{
          type: 'file';
          filename: string;
          mediaType: string;
          url: string;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: 'file',
              filename: file.name,
              mediaType: file.type,
              url: reader.result as string, // Data URL
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function Chat() {
  const [input, setInput] = useState('');
  const {messages, sendMessage} = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.container}>
      {messages.map(message => (
        <div key={message.id} className={styles.messageWrapper}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map(part => {
            if (part.type === 'text') {
              return <div key={`${message.id}-text`}>{part.text}</div>;
            }
          })}
          <div></div>
        </div>
      ))}

      <form className={styles.form}        onSubmit={async event => {
        event.preventDefault();

        const fileParts =
          files && files.length > 0
            ? await convertFilesToDataURLs(files)
            : [];

        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: input }, ...fileParts],
        });

        setFiles(undefined);
        setInput('');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }}>
        <input
          className={styles.fileInput}
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />

        <input
          className={styles.input}
          value={input}
          placeholder="Say something..."
          onChange={event => {
            setInput(event.target.value);
          }}
        />
      </form>
    </div>
  );
}