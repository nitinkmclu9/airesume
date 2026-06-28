import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ResumeIQ AI - Analyze, Optimize, and Get Hired Faster',
  description:
    'AI-powered resume analyzer with ATS scoring, skill gap analysis, interview preparation, and job matching. Get hired faster with ResumeIQ AI.',
  keywords: ['resume analyzer', 'ATS checker', 'AI resume', 'job matching', 'interview prep'],
  openGraph: {
    title: 'ResumeIQ AI',
    description: 'Analyze, Optimize, and Get Hired Faster.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
