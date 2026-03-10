import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Screen Riot',
  description: 'Donate to films',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Suspense fallback={<header className="h-14 border-b border-gray-200 bg-white" />}>
            <Header />
          </Suspense>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
