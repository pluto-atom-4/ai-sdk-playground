'use client'

import styles from "./page.module.css";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [ input, setInput ] = useState("");
  const { messages, sendMessage } = useChat()


  return (
    <div className={styles.container}>
      <div className={styles.messageWrapper}>
        {messages.map(message => (
          <div key={message.id}>
            <strong>{`${message.role}: `}</strong>
            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return <span key={index}>{part.text}</span>;
                  case "tool-extractGoal":
                      return (<pre key={index}>{JSON.stringify(part, null, 2)}</pre>);
              }
            })

            }
          </div>
          ))}
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
            setInput("");
        }}
        >
        <input className={styles.input} value={input} onChange={(event) => setInput(event.currentTarget.value)} />
      </form>
    </div>
  );
}

