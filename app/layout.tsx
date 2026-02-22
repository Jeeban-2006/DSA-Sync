import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://dsasync.vercel.app'),
  title: {
    default: 'DSA Sync - AI Powered Collaborative DSA Growth Platform',
    template: '%s | DSA Sync',
  },
  description: 'Track, compare, and improve your Data Structures & Algorithms solving journey with AI-powered insights, friend collaboration, and smart analytics. Built for competitive programmers.',
  keywords: [
    'DSA tracker',
    'data structures algorithms',
    'competitive programming',
    'coding practice tracker',
    'leetcode tracker',
    'algorithm learning',
    'DSA progress',
    'AI coding assistant',
    'problem solving tracker',
    'collaborative learning',
    'coding analytics',
    'programming dashboard',
    'interview preparation',
    'DSA Sync',
    'Groq AI',
  ],
  authors: [{ name: 'Jeeban Krushna Sahu', url: 'https://github.com/Jeeban-2006' }],
  creator: 'Jeeban Krushna Sahu',
  publisher: 'DSA Sync',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DSA Sync',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dsasync.vercel.app',
    title: 'DSA Sync - AI Powered Collaborative DSA Growth Platform',
    description: 'Track, compare, and improve your Data Structures & Algorithms solving journey with AI-powered insights, friend collaboration, and smart analytics.',
    siteName: 'DSA Sync',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'DSA Sync Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSA Sync - AI Powered Collaborative DSA Growth Platform',
    description: 'Track, compare, and improve your DSA solving journey with AI-powered insights',
    creator: '@DSASync',
    images: ['/icons/icon-512x512.png'],
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
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://dsasync.vercel.app',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DSA Sync',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    description: 'AI-powered collaborative DSA growth platform for competitive programmers. Track, compare, and improve your Data Structures & Algorithms solving journey.',
    url: 'https://dsasync.vercel.app',
    author: {
      '@type': 'Person',
      name: 'Jeeban Krushna Sahu',
      url: 'https://github.com/Jeeban-2006',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    featureList: [
      'Smart DSA Problem Tracking',
      'AI-Powered Recommendations',
      'Friend Comparison & Collaboration',
      'Advanced Analytics Dashboard',
      'Revision Scheduling',
      'Pattern Detection',
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-512x512.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2332',
              color: '#fff',
              border: '1px solid #0f1620',
            },
            success: {
              iconTheme: {
                primary: '#0ea5e9',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
