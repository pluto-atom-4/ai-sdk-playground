# Google Gemini 2.5 Flash Image Generation

A simple console application for generating and editing images using Google Gemini 2.5 Flash via the AI SDK.

## Features

- 🎨 **Generate Images**: Create images from text prompts
- ✏️ **Edit Images**: Modify existing images with new prompts
- 📐 **Multiple Aspect Ratios**: Support for 1:1, 3:4, 4:3, 9:16, and 16:9
- 🔄 **Interactive Editing**: Progressively edit images step by step
- 💬 **Stream Text with Images**: Send images and get streaming text responses
- 📁 **Local Image Support**: Analyze local image files with AI

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.20.0 or higher)
- Google AI API Key

## Setup

### 1. Get Your API Key

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

## Usage

### Generate a Simple Image

Generate a single image from a text prompt:

```bash
pnpm run generate
```

This will:
- Generate an image using the prompt in `src/generate-image.ts`
- Save it to the `generated_images/` folder

### Edit an Image

Generate an image and then edit it with a new prompt:

```bash
pnpm run edit
```

This will:
- Generate an initial image
- Edit it using a reference image
- Save both the initial and edited images

### Try Different Aspect Ratios

Generate the same prompt with different aspect ratios:

```bash
pnpm run aspect-ratios
```

This will generate images in all supported aspect ratios:
- 1:1 (Square)
- 3:4 (Portrait)
- 4:3 (Landscape)
- 9:16 (Mobile Portrait)
- 16:9 (Widescreen)

### Interactive Image Editing

See progressive image editing in action:

```bash
pnpm run interactive
```

This will:
- Generate a base scene
- Add elements step by step
- Save each intermediate result

### Stream Text with Image Prompt

Send an image and get streaming text responses:

```bash
pnpm run stream-text
```

This will:
- Send an image URL to Gemini
- Stream the AI's description in real-time
- Display token usage statistics

### Stream Text with Local Images

Analyze local images with streaming responses:

```bash
pnpm run stream-local
```

This will:
- Demonstrate image analysis from URLs
- Analyze local images from `generated_images/` folder
- Show multi-turn conversations with images

## Customization

### Modify Image Generation Prompts

Edit the prompt in any of the image generation files:

```typescript
const { image } = await generateImage({
  model: google.image('gemini-2.0-flash-exp'),
  prompt: 'Your custom prompt here',
  providerOptions: {
    google: {
      aspectRatio: '1:1',
      outputMimeType: 'image/png',
    },
  },
});
```

### Modify Text Streaming with Images

Edit the streaming text files to use your own images and prompts:

```typescript
const result = streamText({
  model: google('gemini-2.0-flash-exp'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Your question here' },
        { type: 'image', image: 'https://example.com/image.jpg' },
      ],
    },
  ],
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

### Supported Options

#### Aspect Ratios
- `'1:1'` - Square (1024x1024)
- `'3:4'` - Portrait
- `'4:3'` - Landscape
- `'9:16'` - Mobile Portrait
- `'16:9'` - Widescreen

#### Output Formats
- `'image/png'` - PNG format (default)
- `'image/jpeg'` - JPEG format

## Project Structure

```
gemini-image-generation/
├── src/
│   ├── generate-image.ts           # Basic image generation
│   ├── edit-image.ts                # Image editing with reference
│   ├── aspect-ratios.ts             # Aspect ratio examples
│   ├── interactive-edit.ts          # Progressive editing demo
│   ├── stream-text-with-image.ts    # Stream text with image URL
│   └── stream-text-local-image.ts   # Stream text with local images
├── generated_images/                # Output folder (auto-created)
├── .env.example                     # Environment template
├── .env                             # Your API key (create this)
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## Tips

- Generated images are saved to `generated_images/` with timestamps
- Each run creates new images (existing ones are not overwritten)
- Image editing works best with clear, specific prompts
- The model supports both generation and editing in the same API

## Troubleshooting

### "API key not found" error

Make sure you've created a `.env` file with your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### TypeScript errors

Run the type checker:

```bash
pnpm exec tsc --noEmit
```

### Images not saving

The `generated_images/` folder is created automatically. Check file permissions if you see errors.

## Resources

- [AI SDK Documentation](https://ai-sdk.dev)
- [Google Gemini Image Generation Guide](https://ai-sdk.dev/cookbook/guides/google-gemini-image-generation)
- [Google AI Studio](https://aistudio.google.com/)
- [GitHub - Vercel AI SDK](https://github.com/vercel/ai)

## License

ISC

