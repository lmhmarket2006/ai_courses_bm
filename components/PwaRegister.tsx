'use client';

import { useEffect } from 'react';

/**
 * تسجيل Service Worker لدعم PWA (التثبيت على الشاشة الرئيسية).
 * لا يُحمّل الكاش تلقائياً — تحديثاتك تبقى حديثة بعد كل نشر.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* تجاهل صامت في dev أو عند حظر SW */
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
