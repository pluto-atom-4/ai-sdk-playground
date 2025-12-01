"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import styles from "./page.module.css";

export default function Page() {
  const [input, setInput] = useState("");
  const {messages, sendMessage} = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    })
  });

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Chat with AI</h1>

        <input
          type="text"
          placeholder="Type your message and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={async event => {
            if (event.key !== "Enter") {
              return;
            }
            if (input.trim()) {
              sendMessage({
                parts: [{type: "text", text: input}],
              });
              setInput("");
            }
          }}
          className={styles.input}
        />

        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div key={index} className={styles.message}>
              {message.parts.map((part, partIndex) => {
                if (part.type === "text") {
                  return (
                    <div key={`${message.id}-${partIndex}`} className={styles.messageText}>
                      {part.text}
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}