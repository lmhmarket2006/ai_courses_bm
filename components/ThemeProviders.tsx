'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="baytalmosawer-theme">
      {children}
    </ThemeProvider>
  );
}
