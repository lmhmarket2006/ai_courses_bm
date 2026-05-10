'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { TopicSlide } from '@/lib/courses';
import { cn } from '@/lib/utils';

interface TopicSlidesGalleryProps {
  slides: readonly TopicSlide[];
  /** عند فشل تحميل الصورة يُعرض نص المحور المقابل إن وُجد */
  topicTexts?: readonly string[];
  /** لـ aria-labelledby */
  headingId: string;
}

/**
 * معرض أفقي لشرائح محاور الدورة + تكبير (Lightbox) بلوحة تحكم ولتنقل بلوحة المفاتيح.
 */
export default function TopicSlidesGallery({
  slides,
  topicTexts,
  headingId,
}: TopicSlidesGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goTo = useCallback((index: number) => {
    const len = slides.length;
    if (len === 0) return;
    const i = ((index % len) + len) % len;
    setActive(i);
    setLightbox((lb) => (lb !== null ? i : null));
    slideRefs.current[i]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [slides.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') goTo(lightbox - 1);
      if (e.key === 'ArrowLeft') goTo(lightbox + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, goTo]);

  useEffect(() => {
    if (lightbox === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  if (slides.length === 0) return null;

  return (
    <div className="mb-8 space-y-4" role="region" aria-labelledby={headingId}>
      <div className="relative rounded-[1.25rem] border border-brand-subtle bg-linear-to-b from-card to-page/80 p-3 shadow-inner dark:from-card dark:to-transparent md:rounded-2xl md:p-4">
        <div
          className="pointer-events-none absolute inset-y-3 right-0 z-10 w-10 bg-linear-to-l from-card to-transparent md:inset-y-4 md:w-14"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-3 left-0 z-10 w-10 bg-linear-to-r from-card to-transparent md:inset-y-4 md:w-14"
          aria-hidden
        />

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden">
          {slides.map((slide, i) => {
            const fallback = topicTexts?.[i];
            const isBroken = broken[i];
            return (
              <div
                key={`${slide.src}-${i}`}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className={cn(
                  'snap-center shrink-0',
                  /* min(…,100%) بدل 100vw لتفادي تمدد أفقي داخل البطاقة على الجوال */
                  'w-[min(92%,520px)] max-w-full sm:w-[min(88%,520px)]',
                  'md:w-[min(480px,85%)]'
                )}
              >
                <motion.figure
                  layout
                  className="group relative overflow-hidden rounded-xl border border-brand-subtle bg-black/[0.03] shadow-md dark:bg-white/[0.04] md:rounded-2xl"
                >
                  {!isBroken ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActive(i);
                        setLightbox(i);
                      }}
                      className="relative block aspect-[16/10] w-full outline-none transition-transform duration-300 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      aria-label={`تكبير الشريحة ${i + 1} من ${slides.length}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- مسارات ملفات محلية؛ نحتاج onError */}
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                        onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                      />
                      <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 md:text-[10px]">
                        <Maximize2 size={12} aria-hidden />
                        عرض كامل
                      </span>
                    </button>
                  ) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 bg-page/90 p-6 text-center md:min-h-[220px] md:p-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        تعذّر تحميل الصورة
                      </p>
                      <p className="text-sm font-bold leading-relaxed text-foreground md:text-base">
                        {fallback ?? slide.alt}
                      </p>
                      <p className="max-w-[240px] text-[10px] font-medium text-muted-foreground">
                        ضع الملف في المسار{' '}
                        <code className="rounded bg-muted px-1 py-0.5 text-[9px]">{slide.src}</code>
                      </p>
                    </div>
                  )}
                </motion.figure>
              </div>
            );
          })}
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 md:mt-2">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-subtle bg-card text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 md:h-10 md:w-10"
            aria-label="الشريحة السابقة"
          >
            <ChevronRight size={18} className="shrink-0" />
          </button>
          <div className="flex items-center gap-1.5 px-2" role="group" aria-label="اختيار شريحة">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === active ? 'true' : undefined}
                aria-label={`الشريحة ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/60'
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-subtle bg-card text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 md:h-10 md:w-10"
            aria-label="الشريحة التالية"
          >
            <ChevronLeft size={18} className="shrink-0" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[85] flex flex-col bg-[#0a0a12]/92 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={`معرض المحاور، الشريحة ${lightbox + 1} من ${slides.length}`}
          >
            <button
              type="button"
              className="absolute inset-0 z-0 cursor-default border-0 bg-transparent p-0"
              aria-label="إغلاق المعرض"
              onClick={() => setLightbox(null)}
            />
            <div className="relative z-10 flex max-h-screen min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a12]/80 px-4 py-3 backdrop-blur-sm md:px-8">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                  {lightbox + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-10">
                {!broken[lightbox] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slides[lightbox].src}
                    alt={slides[lightbox].alt}
                    className="max-h-[min(78vh,calc(100%-4rem))] max-w-full object-contain shadow-2xl shadow-black/40"
                  />
                ) : (
                  <p className="max-w-lg px-6 text-center text-lg font-bold leading-relaxed text-white">
                    {topicTexts?.[lightbox] ?? slides[lightbox].alt}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => goTo(lightbox - 1)}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8 md:h-12 md:w-12"
                  aria-label="الشريحة السابقة"
                >
                  <ChevronRight size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(lightbox + 1)}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8 md:h-12 md:w-12"
                  aria-label="الشريحة التالية"
                >
                  <ChevronLeft size={22} />
                </button>
              </div>

              <p className="shrink-0 bg-[#0a0a12]/80 px-6 py-4 text-center text-[10px] font-medium text-white/45 backdrop-blur-sm">
                Escape للإغلاق — الأسهم للتنقل — انقر على الخلفية للإغلاق
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
