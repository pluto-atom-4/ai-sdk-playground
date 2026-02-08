import { tool } from 'ai';
import z from 'zod';

/**
 * Get the current weather for a given location
 */
export const getWeather = tool({
  description: 'Get the current weather in a given location',
  inputSchema: z.object({
    location: z.string().describe('The location to get weather for'),
  }),
  execute: async ({ location }: { location: string }) => {
    // Simulate weather API call
    const temperature = Math.floor(Math.random() * 100);
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'][
      Math.floor(Math.random() * 4)
    ];
    return {
      location,
      temperature,
      conditions,
      unit: 'fahrenheit',
    };
  },
});

/**
 * Convert temperature between units
 */
export const convertTemperature = tool({
  description: 'Convert temperature between Celsius and Fahrenheit',
  inputSchema: z.object({
    temperature: z.number().describe('The temperature value to convert'),
    from: z
      .enum(['celsius', 'fahrenheit'])
      .describe('The source temperature unit'),
    to: z
      .enum(['celsius', 'fahrenheit'])
      .describe('The target temperature unit'),
  }),
  execute: async ({
    temperature,
    from,
    to,
  }: {
    temperature: number;
    from: 'celsius' | 'fahrenheit';
    to: 'celsius' | 'fahrenheit';
  }) => {
    let result = temperature;

    if (from === 'celsius' && to === 'fahrenheit') {
      result = (temperature * 9) / 5 + 32;
    } else if (from === 'fahrenheit' && to === 'celsius') {
      result = ((temperature - 32) * 5) / 9;
    }

    return {
      original: temperature,
      from,
      converted: Math.round(result * 100) / 100,
      to,
    };
  },
});

/**
 * Calculate basic math operations
 */
export const calculate = tool({
  description: 'Perform basic mathematical calculations',
  inputSchema: z.object({
    expression: z.string().describe('The mathematical expression to evaluate'),
  }),
  execute: async ({ expression }: { expression: string }) => {
    try {
      // Simple evaluation - in production, use a safe math parser
      const result = Function('"use strict"; return (' + expression + ')')();
      return {
        expression,
        result,
        success: true,
      };
    } catch (error) {
      return {
        expression,
        error: String(error),
        success: false,
      };
    }
  },
});

/**
 * Export all tools as a record for use with streamText
 */
export const tools = {
  getWeather,
  convertTemperature,
  calculate,
};

export type ToolName = keyof typeof tools;

