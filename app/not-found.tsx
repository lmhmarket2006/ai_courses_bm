import Link from 'next/link';
import { Camera, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl logo-gradient text-white">
          <Camera size={36} />
        </div>
        <div className="space-y-3">
          <h1 className="text-7xl font-black tracking-tighter text-foreground">٤٠٤</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            الصفحة التي تبحث عنها غير موجودة. ربما أُزيلت أو تغيّر مسارها.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-secondary via-accent to-primary px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-white shadow-xl shadow-primary/20"
        >
          <Home size={14} />
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
