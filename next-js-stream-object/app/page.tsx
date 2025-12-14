"use client";

import { notificationSchema } from "@/app/api/use-object/schema";
import { experimental_useObject as useObject } from "@ai-sdk/react";

export default function Page() {
  const {object, submit} = useObject({
    api: "/api/use-object",
    schema: notificationSchema
  });

  return (
    <div>
      <button
        onClick={() => submit("Messages during final week")}

      >
        Generate notifications
      </button>
      {object?.notifications?.map((notification, index) => (
      <div key={index} style={{ marginTop: "1rem" }}>
        <p>{notification?.name}</p>
        <p>{notification?.message}</p>
      </div>
      ))}
    </div>
  );
}