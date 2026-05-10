import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Source_Sans_3 } from 'next/font/google';
import { ACADEMY } from '@/lib/config';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProviders } from '@/components/ThemeProviders';
import PwaRegister from '@/components/PwaRegister';
import './globals.css';

const fontAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ar',
  display: 'swap',
});

const fontEn = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-en',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${ACADEMY.name} | مساعدك الذكي للتصوير`,
    template: `%s | ${ACADEMY.name}`,
  },
  description: ACADEMY.tagline,
  keywords: [
    'دورات تصوير',
    'تعلم التصوير',
    'تصوير فوتوغرافي',
    'بيت المصور',
    'أكاديمية تصوير',
    'تصوير الأعراس',
    'تصوير البيوتي',
    'كورسات تصوير السعودية',
  ],
  authors: [{ name: ACADEMY.nameEn }],
  creator: ACADEMY.nameEn,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: SITE_URL,
    siteName: ACADEMY.name,
    title: `${ACADEMY.name} — منصة تعليم التصوير الاحترافية`,
    description: ACADEMY.tagline,
  },
  twitter: {
    card: 'summary_large_image',
    title: ACADEMY.name,
    description: ACADEMY.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  applicationName: ACADEMY.nameEn,
  appleWebApp: {
    capable: true,
    title: ACADEMY.nameEn,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#010A2D' },
    { color: '#FFFBF5' },
  ],
  width: 'device-width',
  initialScale: 1,
  /** يفعّل env(safe-area-inset-*) لأزرار ثابتة على آيفون والشاشات ذات النوتش */
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${fontAr.variable} ${fontEn.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans min-h-dvh min-h-[100svh] overflow-x-clip bg-page text-foreground antialiased"
      >
        <ThemeProviders>
          <ToastProvider>
            <PwaRegister />
            {children}
          </ToastProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
