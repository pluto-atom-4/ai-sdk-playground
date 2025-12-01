import { openai } from "@ai-sdk/openai";
import { experimental_generateImage, tool }  from "ai";
import z from "zod";

export const generateImage = tool({
  description: "Generate an image",
    inputSchema: z.object({
    prompt: z.string().min(1).max(1000).describe("The prompt to generate the image from"),
    }),
    execute: async ({ prompt }) => {
        // Ensure API key is available at runtime
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
          throw new Error('Missing OPENAI_API_KEY environment variable.');
        }

        const { image } = await experimental_generateImage({
          model: openai.imageModel("dall-e-3", { apiKey: OPENAI_API_KEY }),
          prompt,
        });
        return { image: image.base64, prompt}
    }
});