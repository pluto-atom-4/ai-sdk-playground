import { ChatProvider } from './chat-context';
import { ThemeProvider } from './theme-context';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}