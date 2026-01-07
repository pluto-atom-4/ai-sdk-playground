import { ChatProvider } from './chat-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}