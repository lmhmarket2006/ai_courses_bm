'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle, RefreshCw, Star, Clock, Wallet, ArrowLeft, ChevronLeft, Instagram } from 'lucide-react';
import type { Recommendation } from '@/lib/recommender';
import { getCourseById } from '@/lib/recommender';
import { openBooking } from '@/lib/whatsapp';
import { INSTRUCTOR } from '@/lib/config';

interface ResultProps {
  recommendation: Recommendation;
  /** يُغلق الـ modal */
  onClose: () => void;
  /** يُعيد الاستبيان من الصفر */
  onRestart: () => void;
}

const CONFIDENCE_LABELS = {
  high: { text: 'تطابق ممتاز', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  medium: { text: 'تطابق جيد', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low: { text: 'تطابق محتمل', color: 'text-slate-600 bg-slate-50 border-slate-200' },
} as const;

/**
 * بطاقة نتيجة التوصية.
 *
 * هي العنصر الأهم في رحلة التحويل: كل تفصيلة هنا (التصميم، النص، الـ CTA)
 * مُصمّمة لإقناع الزائر بالحجز فوراً عبر الواتساب أو متابعة التحدّث في الشات.
 */
export default function Result({ recommendation, onClose, onRestart }: ResultProps) {
  const course = getCourseById(recommendation.recommendedCourseId);
  if (!course) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 text-sm">حدث خطأ في عرض النتيجة. الرجاء المحاولة مرة أخرى.</p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest"
        >
          إعادة الاستبيان
        </button>
      </div>
    );
  }

  const confidence = CONFIDENCE_LABELS[recommendation.confidence];

  const handleAskMore = () => {
    window.dispatchEvent(
      new CustomEvent('ask-chatbot', {
        detail: {
          courseTitle: course.title,
          question: 'تم اختيار هذه الدورة لي عبر المساعد الذكي. أخبرني المزيد عنها وعن جدول الدورة القادم.',
        },
      })
    );
    onClose();
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  return (
    <div className="overflow-y-auto max-h-[90vh]">
      <div className="p-8 md:p-12">
        {/* رأس النتيجة */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-secondary via-accent to-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/25">
            <Sparkles size={12} />
            توصية مساعدنا الذكي
          </div>
          <h2 className="mb-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">
            بناءً على إجاباتك، الدورة الأنسب لك:
          </h2>
          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${confidence.color}`}>
            {confidence.text}
          </div>
        </motion.div>

        {/* بطاقة الدورة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-linear-to-br from-cream to-white p-8 shadow-[0_30px_60px_-15px_var(--shadow-primary-glow)] dark:from-brand-dark-surface dark:to-brand-dark md:p-10"
        >
          <div className="absolute left-0 top-0 -z-0 h-48 w-48 rounded-br-full bg-linear-to-br from-primary/10 to-transparent" />
          <div className="absolute bottom-0 right-0 -z-0 h-32 w-32 rounded-tl-full bg-linear-to-tl from-secondary/10 to-transparent" />

          <div className="relative z-10">
            <h3 className="mb-4 bg-linear-to-r from-secondary via-accent to-primary bg-clip-text text-3xl font-black leading-tight text-transparent md:text-4xl">
              {course.title}
            </h3>

            <p className="mb-6 text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
              {recommendation.reasoning}
            </p>

            <div className="flex flex-wrap gap-4 border-t border-brand-subtle pt-6">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-accent/10 p-2 text-accent">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">المدة</div>
                  <div className="text-sm font-bold text-foreground">{course.duration ?? 'يُحدَّد لاحقاً'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Wallet size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">الاستثمار</div>
                  <div className="text-sm font-bold text-foreground">{course.price ?? 'عند التواصل'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                  <Star size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">الفئة</div>
                  <div className="text-sm font-bold text-foreground">{course.targetAudience.split('.')[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* شريط المدرب */}
        <motion.a
          href={INSTRUCTOR.instagram}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="group mb-6 flex items-center gap-4 rounded-2xl border border-brand-subtle bg-page p-4 transition-all hover:border-primary/25 hover:bg-card hover:shadow-md"
        >
          <div className="w-10 h-10 logo-gradient rounded-xl flex items-center justify-center text-white shrink-0">
            <span className="text-lg font-black">{INSTRUCTOR.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">يقدّمها المدرب</div>
            <div className="text-sm font-black text-foreground">أ. {INSTRUCTOR.name}</div>
          </div>
          <div className="flex items-center gap-1.5 text-primary transition-transform group-hover:-translate-x-0.5">
            <Instagram size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">أعماله</span>
          </div>
        </motion.a>

        {/* أزرار CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
        >
          <button
            type="button"
            onClick={() => openBooking(course.title, 'توصية ذكية')}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-secondary via-accent to-primary px-6 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            احجز مقعدك الآن
            <MessageCircle size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button
            type="button"
            onClick={handleAskMore}
            className="flex items-center justify-center gap-3 rounded-2xl bg-brand-dark px-6 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-primary active:scale-[0.98]"
          >
            اسأل عن هذه الدورة
            <ArrowLeft size={16} />
          </button>
        </motion.div>

        {/* البدائل */}
        {recommendation.alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-brand-subtle pt-6"
          >
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              أو ربما يناسبك:
            </h4>
            <div className="space-y-2">
              {recommendation.alternatives.map((alt) => {
                const altCourse = getCourseById(alt.courseId);
                if (!altCourse) return null;
                return (
                  <div
                    key={alt.courseId}
                    className="flex items-start gap-4 rounded-2xl border border-brand-subtle bg-page p-4"
                  >
                    <ChevronLeft size={16} className="mt-1 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-extrabold text-foreground">{altCourse.title}</div>
                      <div className="text-xs font-medium leading-relaxed text-muted-foreground">{alt.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* إعادة الاستبيان */}
        <div className="mt-8 border-t border-brand-subtle pt-6 text-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
          >
            <RefreshCw size={12} />
            إعادة الاستبيان
          </button>
        </div>
      </div>
    </div>
  );
}
