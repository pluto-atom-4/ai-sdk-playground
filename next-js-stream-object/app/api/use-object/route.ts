import { notificationSchema } from "@/app/api/use-object/schema";
import { streamObject } from "ai";

import { openai } from "@ai-sdk/openai";

export const maxDuration = 30 // 30 seconds

export async function POST(req: Request, res: Response) {
  const context = await res.json();

  const result = streamObject({
    model: openai('gpt-4.1'),
    schema: notificationSchema,
    prompt: `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}