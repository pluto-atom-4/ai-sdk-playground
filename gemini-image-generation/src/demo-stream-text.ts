import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple example demonstrating streaming text responses with image prompts
 * Based on: https://ai-sdk.dev/cookbook/next/stream-text-with-image-prompt
 */
async function main() {
  try {
    console.log('🚀 Stream Text with Image Prompt Demo\n');

    // Example 1: Single image with question
    console.log('Example 1: Describe an image');
    console.log('─'.repeat(60));

    const result = streamText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image',
              image: new URL(
                'https://raw.githubusercontent.com/vercel/ai/refs/heads/main/examples/ai-core/data/comic-cat.png',
              ),
              mediaType: 'image/jpeg',
            },
          ],
        },
      ],
    });

    // Stream the response
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n' + '─'.repeat(60));

    // Wait for completion
    await result;

    console.log('\n✅ Demo completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   • Use image URLs or base64 data URLs');
    console.log('   • Combine multiple images and text in one prompt');
    console.log('   • Create multi-turn conversations with images');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 Make sure you have set GOOGLE_GENERATIVE_AI_API_KEY in .env');
    process.exit(1);
  }
}

main();

