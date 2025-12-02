"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import React, { useState } from "react";
import styles from "./page.module.css";

type MessagePart = {
  type: string;
  state?: string;
  input?: { prompt?: string } | unknown;
  output?: { image?: string } | unknown;
  text?: string;
  image?: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { messages, sendMessage } = useChat();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parts: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [];

    if (input.trim()) {
      parts.push({ type: "text", text: input });
    }

    if (imageUrl.trim()) {
      parts.push({ type: "image", image: imageUrl });
    }

    if (parts.length > 0) {
      sendMessage({
        role: "user",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parts: parts as any,
      });

      setInput("");
      setImageUrl("");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.messages}>
          {messages.map((message) => {
            const parts = Array.isArray(message.parts) ? message.parts : [];
            return parts.map((p: MessagePart, partIndex: number) => {
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
                    <div key={`${message.id}-part-${partIndex}`}>
                      <Image
                        src={outputObj?.image ?? ""}
                        alt={inputObj?.prompt ?? "Generated image"}
                        width={300}
                        height={200}
                        className={styles.image}
                      />
                    </div>
                  );
                }
              }

              if (p.type === "image") {
                const imageUrl = (p as { image?: string }).image;
                return (
                  <div key={`${message.id}-part-${partIndex}`}>
                    <Image
                      src={imageUrl ?? ""}
                      alt="User uploaded image"
                      width={300}
                      height={200}
                      className={styles.image}
                    />
                  </div>
                );
              }

              return null;
            });
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
          <input
            type="text"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="Image URL (optional)..."
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}