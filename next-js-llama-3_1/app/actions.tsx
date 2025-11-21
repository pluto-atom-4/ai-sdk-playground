'use server';

import { streamUI } from '@ai-sdk/rsc';
import { deepinfra } from '@ai-sdk/deepinfra';
import { ReactNode } from "react";
import { z } from 'zod';

export async function streamComponent() {
  const result = await streamUI({
    model: deepinfra('meta-llama/Meta-Llama-3.1-70B-Instruct'),
    prompt: 'Get the weather for San Francisco',
    text: ({ content }: { content: ReactNode }) => <div>{content}</div>,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        inputSchema: z.object({ location: z.string() }),
        generate: async function* ({ location }: { location: string }) {
          yield <div>loading...</div>;
          const weather = '25c'; // await getWeather(location);
          return (
            <div>
              the weather in {location} is {weather}.
            </div>
          );
        },
      },
    },
  });
  return result.value;
}