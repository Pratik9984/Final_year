import type { Metadata } from 'next';
import './globals.css';
import { OfficerProvider } from '@/context/OfficerContext';

export const metadata: Metadata = {
  title: 'MahaGov-Pulse Officer Desk | महाराष्ट्र शासन - महसूल व आरटीएस अधिकारी प्रणाली',
  description: 'Autonomous Sovereign Intranet Portal for Nayab Tahsildar Queue, Blind Dossier Review, ECDSA P-256 Digital Signing, and Consortium Explorer',
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
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body>
        <OfficerProvider>
          {children}
        </OfficerProvider>
      </body>
    </html>
  );
}
