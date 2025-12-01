"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

type MessagePart = {
  type: string;
  state?: string;
  input?: { prompt?: string } | unknown;
  output?: { image?: string } | unknown;
  text?: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sendMessage({
      parts: [{ type: "text", text: input }],
    });

    setInput("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Chat with AI</h1>

        <div className={styles.messagesContainer}>
          {messages.map((message) => {
            return (
              <div key={message.id} className={styles.message}>
                <div>
                  <div className={styles.messageRole}>{message.role}</div>

                  {message.parts.map((part, partIndex) => {
                    const p = part as MessagePart;

                    if (p.type === "text") {
                      return (
                        <div
                          key={`${message.id}-part-${partIndex}`}
                          className={styles.messageText}
                        >
                          {p.text}
                        </div>
                      );
                    }

                    if (p.type === "tool-generateImage") {
                      const { state } = p;

                      if (state === "input-available") {
                        return (
                          <div
                            key={`${message.id}-part-${partIndex}`}
                            className={styles.imagePrompt}
                          >
                            Generating image...
                          </div>
                        );
                      }

                      if (state === "output-available") {
                        const inputObj = p.input as { prompt?: string } | undefined;
                        const outputObj = p.output as { image?: string } | undefined;

                        return (
                          <Image
                            key={`${message.id}-part-${partIndex}`}
                            src={`data:image/png;base64,${outputObj?.image ?? ""}`}
                            alt={inputObj?.prompt ?? "generated image"}
                            width={400}
                            height={400}
                            className={styles.image}
                          />
                        );
                      }
                    }

                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className={styles.input}
          />
        </form>
      </div>
    </div>
  );
}