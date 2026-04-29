'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, Wallet, Share2 } from 'lucide-react';
import { COURSES, type Course } from '@/lib/courses';
import { openBooking } from '@/lib/whatsapp';
import ShareModal from '@/components/share/ShareModal';

interface FeaturedCoursesProps {
  onSelectCourse?: (id: string) => void;
}

const FEATURED_IDS = ['basics', 'beauty'] as const;

/**
 * يعرض الدورتين الأكثر طلباً في صف بطاقات كبيرة وفاخرة.
 * الدورات تُحدَّد من `FEATURED_IDS` وتُسحَب تلقائياً من قائمة COURSES.
 */
export default function FeaturedCourses({ onSelectCourse }: FeaturedCoursesProps) {
  const [shareTarget, setShareTarget] = useState<Course | null>(null);
  const featured = COURSES.filter((c) => FEATURED_IDS.includes(c.id as (typeof FEATURED_IDS)[number]));

  return (
    <>
      <section className="mb-24">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-8 w-2 rounded-full logo-gradient" />
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">دورات مختارة بعناية</h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {featured.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-brand-subtle bg-card p-10 transition-all duration-500 hover:border-primary/25 luxury-shadow"
            >
              <div className="absolute right-0 top-0 -z-10 h-48 w-48 rounded-bl-full bg-linear-to-br from-primary/8 to-transparent transition-transform duration-700 group-hover:scale-110" />

              {course.id === 'beauty' && (
                <div className="absolute left-8 top-8 flex animate-pulse items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
                  <Sparkles size={14} />
                  <span>فريد من نوعه</span>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareTarget(course);
                }}
                aria-label={`مشاركة دورة ${course.title}`}
                className="absolute right-8 top-8 translate-y-2 rounded-2xl border border-brand-subtle bg-card/90 p-3 text-muted-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:text-primary group-hover:translate-y-0 group-hover:opacity-100 luxury-shadow"
              >
                <Share2 size={18} />
              </button>

              <div className="mb-10">
                <h3 className="mb-4 bg-linear-to-r from-foreground to-foreground/90 bg-clip-text text-4xl font-black leading-tight text-transparent transition-all duration-500 group-hover:from-secondary group-hover:via-accent group-hover:to-primary">
                  {course.title}
                </h3>
                <p className="text-[17px] font-medium leading-relaxed text-secondary/75">{course.about}</p>
                <div className="mt-4 inline-block rounded-xl bg-page p-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    استثمارك في مستقبلك اليوم، هو نجاحك غداً
                  </span>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-10 border-t border-brand-subtle pt-8">
                <InfoBadge icon={<Clock size={20} />} label="المدة الزمنية" value={course.duration ?? '—'} accentClass="text-accent" />
                <InfoBadge icon={<Wallet size={20} />} label="الاستثمار" value={course.price ?? 'عند التواصل'} accentClass="text-primary" />
              </div>

              <div className="mt-12 flex gap-4">
                <button
                  type="button"
                  onClick={() => openBooking(course.title, 'بطاقة مميّزة')}
                  className="flex-[2] rounded-2xl bg-linear-to-r from-secondary via-accent to-primary py-4 text-[11px] font-extrabold uppercase tracking-[0.3em] text-white shadow-xl shadow-primary/15 transition-all hover:scale-[1.02] active:scale-95"
                >
                  ابدأ رحلتك الآن
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCourse?.(course.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-subtle bg-card py-4 text-[10px] font-extrabold uppercase tracking-widest text-foreground transition-all hover:bg-page"
                >
                  التفاصيل
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <ShareModal course={shareTarget} onClose={() => setShareTarget(null)} />
    </>
  );
}

function InfoBadge({
  icon, label, value, accentClass,
}: { icon: React.ReactNode; label: string; value: string; accentClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-xl bg-page p-2.5 ${accentClass}`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}
