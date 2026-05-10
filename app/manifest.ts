import type { MetadataRoute } from 'next';
import { ACADEMY } from '@/lib/config';

/**
 * Web App Manifest — PWA (تثبيت، شاشة مستقلة، RTL، لغة عربية).
 * يُعرَض تلقائياً على `/manifest.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  const name = ACADEMY.name.replace(/\s+/g, ' ').trim();

  return {
    id: '/',
    name: `${name} — ${ACADEMY.nameEn}`,
    short_name: 'بيت المصور',
    description: ACADEMY.tagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    orientation: 'natural',
    dir: 'rtl',
    lang: 'ar',
    theme_color: '#be1622',
    background_color: '#fffbf5',
    categories: ['education', 'photography'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
