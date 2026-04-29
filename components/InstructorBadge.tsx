'use client';

import React from 'react';
import { Instagram, Award } from 'lucide-react';
import { INSTRUCTOR } from '@/lib/config';

interface InstructorBadgeProps {
  /**
   * `compact`: سطر واحد، للأماكن الضيقة (Footer، نتيجة التوصية).
   * `full`: بطاقة كاملة بصورة + bio + رابط، لأقسام التفاصيل.
   */
  variant?: 'compact' | 'full';
  /** درجة بصرية مختلفة للخلفية الفاتحة/الداكنة */
  theme?: 'light' | 'dark';
}

/**
 * بطاقة المدرب الموحّدة.
 *
 * تستخدم بيانات `INSTRUCTOR` من `lib/config.ts` كمصدر وحيد للحقيقة،
 * فأي تعديل لاحق على اسم المدرب أو رابطه يَسري على كل الموقع تلقائياً.
 */
export default function InstructorBadge({
  variant = 'full',
  theme = 'light',
}: InstructorBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 text-[11px] font-extrabold">
        <span className={theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'}>
          المدرب:
        </span>
        <span className={theme === 'dark' ? 'text-[#fff9f0]' : 'text-foreground'}>
          أ. {INSTRUCTOR.name}
        </span>
        <a
          href={INSTRUCTOR.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`إنستجرام ${INSTRUCTOR.name}`}
          className={`inline-flex items-center gap-1 transition-colors ${theme === 'dark' ? 'text-primary hover:text-white' : 'text-primary hover:text-accent'}`}
        >
          <Instagram size={12} />
          @{INSTRUCTOR.instagramHandle}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-brand-subtle bg-card p-6 shadow-sm md:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="h-5 w-1 rounded-full logo-gradient" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground md:text-[11px]">
          مدرب الدورة
        </h4>
      </div>

      <div className="flex items-start gap-5">
        {/* أفاتار بحرف الاسم */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl logo-gradient text-white shadow-xl shadow-primary/20 md:h-20 md:w-20">
          <span className="text-2xl md:text-3xl font-black">
            {INSTRUCTOR.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-black tracking-tight text-foreground md:text-xl">
              {INSTRUCTOR.name}
            </h3>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary md:text-[9px]">
              <Award size={10} />
              معتمد
            </div>
          </div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-accent md:text-[12px]">
            {INSTRUCTOR.title}
          </p>
          <p className="mb-4 text-sm font-medium leading-relaxed text-muted-foreground">
            {INSTRUCTOR.bio}
          </p>

          <a
            href={INSTRUCTOR.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-subtle bg-page px-4 py-2 text-[11px] font-extrabold text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-primary hover:shadow-md"
          >
            <Instagram size={14} className="text-primary" />
            <span>شاهد أعماله على إنستجرام</span>
            <span className="font-mono text-muted-foreground/80">@{INSTRUCTOR.instagramHandle}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
