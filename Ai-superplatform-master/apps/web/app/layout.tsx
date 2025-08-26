import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AIAssistant } from '@/components/ai/assistant';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Vitality AI - Your Complete Life Companion',
    template: '%s | Vitality AI',
  },
  description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth. Your complete life companion.',
  keywords: [
    'AI companion',
    'life optimization',
    'health tracking',
    'financial management',
    'personal growth',
    'productivity',
    'wellness',
    'automation',
    'life hacks',
    'government resources',
  ],
  authors: [{ name: 'Vitality AI Team' }],
  creator: 'Vitality AI',
  publisher: 'Vitality AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    title: 'Vitality AI - Your Complete Life Companion',
    description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth.',
    siteName: 'Vitality AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vitality AI - Your Complete Life Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitality AI - Your Complete Life Companion',
    description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth.',
    images: ['/og-image.png'],
    creator: '@vitalityai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <Providers>
          <div className="flex min-h-full flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <AIAssistant />
          </div>
        </Providers>
      </body>
    </html>
  );
}

