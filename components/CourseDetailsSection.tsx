'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Info, Clock, Wallet, BookOpen, Award, Users, Target, Smartphone,
  MessageCircle, Star,
} from 'lucide-react';
import type { Course } from '@/lib/courses';
import { getTopicDisplay } from '@/lib/topic-display';
import { openBooking } from '@/lib/whatsapp';
import InstructorBadge from './InstructorBadge';
import TopicSlidesGallery from '@/components/courses/TopicSlidesGallery';

interface CourseDetailsSectionProps {
  course: Course | null;
}

const PERKS = [
  { icon: <Award size={16} />, text: 'شهادة إتمام معتمدة' },
  { icon: <Users size={16} />, text: 'دعم فني بعد الدورة' },
  { icon: <Target size={16} />, text: 'تطبيق عملي مباشر' },
  { icon: <Smartphone size={16} />, text: 'محتوى رقمي متطور' },
];

export default function CourseDetailsSection({ course }: CourseDetailsSectionProps) {
  if (!course) return null;

  return (
    <motion.section
      id="course-details-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative mt-16 overflow-hidden rounded-[2.5rem] border border-brand-subtle bg-card p-6 sm:p-10 md:mt-32 md:rounded-[4rem] md:p-16 lg:p-24 luxury-shadow"
    >
      <DecorativeBackdrop />

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <CourseSummary course={course} />
        <CourseTopics course={course} />
      </div>
    </motion.section>
  );
}

function DecorativeBackdrop() {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-bl-full bg-linear-to-br from-primary/10 to-transparent"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-tr-full bg-linear-to-tr from-secondary/10 to-transparent"
      />
    </>
  );
}

function CourseSummary({ course }: { course: Course }) {
  return (
    <div className="flex-1 w-full space-y-10 md:space-y-12">
      <div className="inline-flex items-center gap-3 rounded-full border border-brand-subtle bg-card/90 px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary backdrop-blur-sm md:text-[10px] md:tracking-[0.4em]">
        <BookOpen size={14} />
        <span>تفاصيل المسار الاحترافي</span>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h2 className="text-4xl font-black leading-[1.1] tracking-tighter text-foreground sm:text-5xl md:text-7xl">
          {course.title}
        </h2>
        <div className="flex items-center gap-2 md:gap-3" aria-label="تقييم 5 من 5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={12} className="fill-primary text-primary" />
          ))}
          <span className="mr-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground md:text-[10px]">
            دورة معتمدة ومقيمة
          </span>
        </div>
      </div>

      <p className="max-w-xl text-xl font-bold leading-relaxed text-accent/85 sm:text-2xl md:text-3xl">
        {course.about}
      </p>

      <div className="grid grid-cols-1 gap-8 border-t border-brand-subtle pt-8 sm:grid-cols-2 md:gap-12">
        <Metric
          label="الجدول الزمني"
          value={course.duration ?? 'يُحدَّد لاحقاً'}
          icon={<Clock size={20} className="md:h-6 md:w-6" />}
          iconWrapClass="bg-accent/12 text-accent"
        />
        <Metric
          label="قيمة الاستثمار"
          value={course.price ?? 'عند التواصل'}
          icon={<Wallet size={20} className="md:h-6 md:w-6" />}
          iconWrapClass="bg-primary/12 text-primary"
        />
      </div>

      <div className="space-y-4 rounded-[2rem] border border-brand-subtle bg-page p-6 md:rounded-[2.5rem] md:p-8">
        <p className="text-sm font-bold leading-relaxed text-accent">
          ⭐ &quot;شراء الكاميرا مصروف، لكن تعلم كيف تبدع بها هو أعظم استثمار لمستقبلك المهني.&quot;
        </p>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-brand-subtle bg-card p-6 md:space-y-6 md:rounded-[2.5rem] md:p-8">
        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground md:text-[10px]">مميزات إضافية</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {PERKS.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 text-muted-foreground">
              <div className="text-primary">{p.icon}</div>
              <span className="text-xs font-bold">{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* بطاقة المدرب */}
      <InstructorBadge variant="full" />
    </div>
  );
}

function Metric({
  label, value, icon, iconWrapClass,
}: { label: string; value: string; icon: React.ReactNode; iconWrapClass: string }) {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground md:text-[10px]">{label}</span>
      <div className="flex items-center gap-3 text-foreground md:gap-4">
        <div className={`rounded-[1.2rem] p-2.5 md:rounded-2xl md:p-3 ${iconWrapClass}`}>{icon}</div>
        <span className="text-lg font-bold md:text-xl">{value}</span>
      </div>
    </div>
  );
}

function CourseTopics({ course }: { course: Course }) {
  return (
    <div className="relative w-full flex-1 space-y-12 rounded-[2rem] border border-brand-subtle bg-card p-6 sm:p-10 md:space-y-16 md:rounded-[3rem] md:p-20">
      <div>
        <h3 className="mb-8 flex items-center gap-4 text-lg font-black uppercase tracking-widest text-foreground md:mb-12 md:text-xl">
          <div className="w-1.5 md:w-2 h-6 md:h-8 logo-gradient rounded-full" />
          محاور الرحلة التعليمية
        </h3>
        {course.topicSlides && course.topicSlides.length > 0 && (
          <>
            <h4
              id={`details-${course.id}-slides-heading`}
              className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary md:text-[11px]"
            >
              معرض المحاور
            </h4>
            <TopicSlidesGallery
              slides={course.topicSlides}
              topicTexts={
                course.topicSlides.length === course.topics.length
                  ? course.topics
                  : undefined
              }
              headingId={`details-${course.id}-slides-heading`}
            />
          </>
        )}
        <ul className="space-y-4 md:space-y-6 relative">
          <div className="absolute bottom-4 right-[23px] top-4 hidden w-px bg-[var(--border-subtle)] sm:block md:right-[27px]" />
          {course.topics.map((topic, i) => {
            const { icon, colorClass, categoryName } = getTopicDisplay(topic, 18);
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 md:gap-8 items-center group relative"
              >
                <div className={`z-10 shrink-0 rounded-xl border bg-card p-3 shadow-sm transition-all duration-500 group-hover:scale-110 md:rounded-2xl md:p-4 ${colorClass}`}>
                  {icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40 mb-1 md:mb-1.5">
                    {categoryName}
                  </span>
                  <span className="text-base font-bold leading-tight text-muted-foreground transition-colors group-hover:text-foreground md:text-lg">
                    {topic}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-6 border-t border-brand-subtle pt-10">
        {course.notes && (
          <div className="flex items-start gap-4 rounded-[1.5rem] bg-page p-6 md:gap-5 md:rounded-3xl md:p-8">
            <Info size={20} className="mt-1 shrink-0 text-secondary md:h-6 md:w-6" />
            <p className="text-sm font-bold italic leading-relaxed text-secondary/80 md:text-base">
              {course.notes}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => openBooking(course.title, 'تفاصيل الدورة')}
          className="btn-premium group flex w-full items-center justify-center gap-3 rounded-[1.2rem] bg-linear-to-r from-secondary via-accent to-primary px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_-12px_var(--shadow-primary-glow)] transition-all hover:scale-[1.02] active:scale-95 md:gap-4 md:rounded-[1.5rem] md:px-12 md:py-6 md:text-[12px] md:tracking-[0.5em]"
        >
          <span>احجز مكانك في الدفعة القادمة</span>
          <MessageCircle size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
        </button>
        <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          سيقوم فريقنا بالتواصل معك لتأكيد الحجز فوراً
        </p>
      </div>
    </div>
  );
}
