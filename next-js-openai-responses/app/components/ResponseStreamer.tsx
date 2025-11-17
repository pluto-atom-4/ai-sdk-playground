"use client";

import { generateOpenAIResponse } from "@/app/actions/generateResponse";
import { FormEvent, useEffect, useState } from "react";

const DEFAULT_PROMPT = "What happened in San Francisco last week?";

interface ResponseData {
  text: string;
  sources?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
  }>;
}

export default function ResponseStreamer() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load default prompt on mount
  useEffect(() => {
    handleSubmit(new Event("submit") as any);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement> | Event) {
    e.preventDefault?.();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await generateOpenAIResponse(prompt);
      setResponse(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-black">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
              OpenAI Responses API
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              GPT-4o Mini with Web Search Tool
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                Model: gpt-4o-mini
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                Tool: webSearch
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-black dark:text-white"
              >
                Enter your prompt:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 dark:disabled:bg-zinc-800"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600"
            >
              {isLoading ? "Generating..." : "Generate Response"}
            </button>
          </form>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-black dark:text-white">
                  Response:
                </h2>
                <div className="min-h-32 rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {response.text}
                  </p>
                </div>
              </div>

              {response.sources && response.sources.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    Sources:
                  </h2>
                  <div className="space-y-2">
                    {response.sources.map((source, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        {source.title && (
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {source.title}
                          </p>
                        )}
                        {source.snippet && (
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {source.snippet}
                          </p>
                        )}
                        {source.url && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 truncate">
                            {source.url}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

