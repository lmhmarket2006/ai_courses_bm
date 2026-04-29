'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary على مستوى المسار (يلتقطها Next.js تلقائياً).
 * يُعرَض بدلاً من شاشة بيضاء عند فشل أي مكوّن خادم/عميل.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] uncaught error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <AlertTriangle size={36} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-foreground">حدث خطأ غير متوقع</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            نعتذر! واجهنا مشكلة تقنية. يمكنك إعادة المحاولة، وإن استمرت المشكلة تواصل معنا.
          </p>
          {error.digest && <p className="font-mono text-[10px] text-muted-foreground">رمز الخطأ: {error.digest}</p>}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-secondary via-accent to-primary px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-white shadow-xl shadow-primary/20"
        >
          <RefreshCw size={14} />
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
