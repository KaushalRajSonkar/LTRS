import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'LearnHub - Master Skills with Expert-Led Courses',
    template: '%s | LearnHub'
  },
  description: 'Learn in-demand skills with high-quality video courses taught by industry experts. Start your learning journey today.',
  keywords: ['online learning', 'video courses', 'education', 'skills', 'tutorials'],
  authors: [{ name: 'LearnHub' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studymeta.in',
    siteName: 'LearnHub',
    title: 'LearnHub - Master Skills with Expert-Led Courses',
    description: 'Learn in-demand skills with high-quality video courses taught by industry experts.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LearnHub'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnHub - Master Skills with Expert-Led Courses',
    description: 'Learn in-demand skills with high-quality video courses taught by industry experts.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
