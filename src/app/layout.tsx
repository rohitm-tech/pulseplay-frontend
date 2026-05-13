import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'PulsePlay — IPL second screen',
  description: 'Real-time cricket engagement, polls, chat, and AI insights.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#03140c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
