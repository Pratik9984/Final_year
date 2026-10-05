import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'MahaGov-Pulse | महाराष्ट्र शासन - डिजिटल सेवा प्रणाली',
  description: 'Autonomous, Zero-Corruption, Unified Digital Government Operating System for Maharashtra State Certificate Lifecycle',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body className="theme-gov-light">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
