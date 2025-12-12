'use client';

import { useState, useEffect } from 'react';

interface Message {
  name: string;
  message: string;
  minutesAgo: number;
}

export default function Page() {
  const [generation, setGeneration] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (savedTheme === null && prefersDark));
  }, []);

  useEffect(() => {
    // Update localStorage and document class
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-object', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Messages during finals week.',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      console.log('API Response:', json);

      // Extract the notifications array from the API response
      const notifications = json.notifications || json.object || [];
      setGeneration(Array.isArray(notifications) ? notifications : []);
    } catch (error) {
      console.error('Error generating object:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setGeneration([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors duration-300">
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Object Generator
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Generating...' : '✨ Generate'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Output Section */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin mb-2 text-2xl">⏳</div>
                <p className="text-lg font-medium">Generating your messages...</p>
              </div>
            </div>
          ) : generation.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                Messages ({generation.length})
              </h2>
              <div className="space-y-3">
                {generation.map((msg, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {msg.name}
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                        {msg.minutesAgo}m ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                Click the &quot;Generate&quot; button to fetch messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}