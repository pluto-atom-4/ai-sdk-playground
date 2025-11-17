"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateOpenAIResponse(prompt: string) {
  try {
    // Generate text from the OpenAI model using Responses API with tools
    const result = await generateText({
      model: openai.responses("gpt-4o-mini"),
      prompt: prompt,
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "high",
        }),
      },
    });

    return {
      text: result.text,
      sources: result.sources,
    };
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from OpenAI");
  }
}

