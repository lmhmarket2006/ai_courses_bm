import { Camera } from 'lucide-react';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl logo-gradient text-white">
          <Camera size={28} />
        </div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-muted-foreground">جاري التحميل...</div>
      </div>
    </main>
  );
}
