import { openai } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('pdf') as File;

  // Convert the file's arrayBuffer to a Base64 data URL
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert Uint8Array to an array of characters
  const charArray = Array.from(uint8Array, byte => String.fromCharCode(byte));
  const binaryString = charArray.join('');
  const base64Data = btoa(binaryString);
  const fileDataUrl = `data:application/pdf;base64,${base64Data}`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze the following PDF and generate a summary.',
          },
          {
            type: 'file',
            data: fileDataUrl,
            mediaType: 'application/pdf',
          },
        ],
      },
    ],
    schema: z.object({
      people: z
        .object({
          name: z.string().describe('The name of the person.'),
          age: z.number().min(0).describe('The age of the person.'),
        })
        .array()
        .describe('An array of people.'),
    }),
  });

  return Response.json(result.object);
}
