'use client'


import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [ input, setInput ] = useState("");
  const { messages, sendMessage } = useChat()


  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          test
        </div>
        ))}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
            setInput("");
        }}
        >
        <input value={input} onChange={(event) => setInput(event.currentTarget.value)} />
      </form>
    </div>
  );
}

