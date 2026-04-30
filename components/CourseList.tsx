'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Zap, Heart, Clock, Wallet, ChevronDown,
  Video, Smartphone, MessageCircleQuestion, X, Send, MessageCircle, Share2,
} from 'lucide-react';
import { COURSES, type Course } from '@/lib/courses';
import { getTopicDisplay } from '@/lib/topic-display';
import { openBooking } from '@/lib/whatsapp';
import ShareModal from '@/components/share/ShareModal';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/motion-variants';

const CATEGORY_ICONS: Record<Course['category'], React.ReactNode> = {
  photography: <Camera size={14} className="text-primary" />,
  lighting: <Zap size={14} className="text-secondary" />,
  specialized: <Heart size={14} className="text-primary" />,
  video: <Video size={14} className="text-secondary" />,
  mobile: <Smartphone size={14} className="text-accent" />,
};

const CATEGORY_LABELS: Record<Course['category'], string> = {
  photography: 'تصوير فوتوغرافي',
  lighting: 'إضاءة احترافية',
  specialized: 'تخصصات دقيقة',
  video: 'فيديو ومونتاج',
  mobile: 'تصوير جوال',
};

const CATEGORY_BAR: Record<Course['category'], string> = {
  photography: 'bg-primary',
  lighting: 'bg-secondary',
  specialized: 'bg-accent',
  video: 'bg-secondary',
  mobile: 'bg-accent',
};

interface CourseListProps {
}

export default function CourseList({}: CourseListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [askCourse, setAskCourse] = useState<Course | null>(null);
  const [shareTarget, setShareTarget] = useState<Course | null>(null);
  const [question, setQuestion] = useState('');

  const submitQuestion = () => {
    if (!question.trim() || !askCourse) return;

    window.dispatchEvent(
      new CustomEvent('ask-chatbot', {
        detail: { courseTitle: askCourse.title, question },
      })
    );

    if (window.innerWidth < 1024) {
      const mobileChat = document.getElementById('mobile-chatbot');
      mobileChat?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setQuestion('');
    setAskCourse(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 auto-rows-max">
      {COURSES.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          index={index}
          layoutClass={index === 0 ? 'xl:col-span-2' : ''}
          isExpanded={expandedId === course.id}
          onToggleExpand={() => setExpandedId((id) => (id === course.id ? null : course.id))}
          onAsk={() => setAskCourse(course)}
          onShare={() => setShareTarget(course)}
        />
      ))}

      <div className="bg-card rounded-[2rem] p-10 border border-brand-subtle flex flex-col items-center justify-center text-center group hover:border-primary/35 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-20px_var(--shadow-primary-glow)] transition-all duration-300 ease-out cursor-pointer luxury-shadow md:col-span-2 xl:col-span-1">
        <div className="text-4xl text-primary mb-4 group-hover:scale-110 transition-transform duration-300 ease-out">
          +
        </div>
        <div className="font-extrabold text-sm text-foreground mb-2 uppercase tracking-widest">الدبلومة الشاملة</div>
        <div className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-[0.2em]">
          كامل المسارات في برنامج متكامل
        </div>
      </div>

      <AskTrainerModal
        course={askCourse}
        question={question}
        onQuestionChange={setQuestion}
        onClose={() => setAskCourse(null)}
        onSubmit={submitQuestion}
      />

      <ShareModal course={shareTarget} onClose={() => setShareTarget(null)} />
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  index: number;
  layoutClass?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAsk: () => void;
  onShare: () => void;
}

function CourseCard({
  course, index, layoutClass, isExpanded, onToggleExpand, onAsk, onShare,
}: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 14 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={cardHover}
      whileTap={{ scale: 0.985 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[2rem] border border-brand-subtle bg-card shadow-sm transition-colors duration-300 ease-out hover:border-primary/50 hover:shadow-[0_28px_60px_-18px_var(--shadow-primary-glow)]',
        isExpanded && 'border-primary/45 ring-1 ring-primary/15',
        layoutClass
      )}
    >
      <div className={cn('h-1.5 w-full shrink-0', CATEGORY_BAR[course.category])} aria-hidden />

      <div className="flex flex-1 flex-col p-8">
        {index === 0 && (
          <span className="absolute top-7 left-5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-primary">
            الأكثر طلباً
          </span>
        )}

        <div className="mb-3 mt-1 flex items-center gap-2">
          <div className="rounded-lg bg-primary/5 p-1.5 dark:bg-white/5">{CATEGORY_ICONS[course.category]}</div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {CATEGORY_LABELS[course.category]}
          </span>
        </div>

        <h3 className="mb-3 text-2xl font-black text-foreground transition-all duration-500 group-hover:bg-linear-to-r group-hover:from-secondary group-hover:via-accent group-hover:to-primary group-hover:bg-clip-text group-hover:text-transparent">
          {course.title}
        </h3>

        <div className="mb-6 flex gap-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
          {course.duration && (
            <span className="flex items-center gap-1.5 opacity-90">
              <Clock size={12} className="text-accent" />
              {course.duration}
            </span>
          )}
          {course.price && (
            <span className="flex items-center gap-1.5 border-r border-brand-subtle pr-4 text-primary">
              <Wallet size={12} />
              {course.price}
            </span>
          )}
        </div>

        <p
          className={cn(
            'mb-6 text-[13px] font-medium leading-relaxed text-accent/90 transition-all md:text-[15px] dark:text-accent/85',
            !isExpanded && 'line-clamp-3'
          )}
        >
          {course.about}
        </p>

        <div className="mb-8 rounded-xl border border-secondary/15 bg-secondary/5 p-3 dark:border-secondary/25 dark:bg-secondary/10">
          <p className="text-[10px] font-bold leading-tight text-secondary">
            ✨ هذا المسار هو استثمارك الحقيقي لتحويل شغفك إلى مهنة مربحة.
          </p>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'circOut' }}
              className="overflow-hidden"
            >
              <div className="mb-8 space-y-5 border-t border-brand-subtle pt-6">
                <div>
                  <h4 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
                    محاور البرنامج:
                  </h4>
                  <ul className="space-y-4">
                    {course.topics.map((topic, i) => {
                      const { icon, colorClass, categoryName } = getTopicDisplay(topic, 14);
                      return (
                        <li key={i} className="group/item flex items-center gap-4 text-[11px] text-muted-foreground">
                          <div
                            className={cn(
                              'flex shrink-0 items-center justify-center rounded-xl border p-2 shadow-sm transition-all group-hover/item:scale-110',
                              colorClass
                            )}
                          >
                            {icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] opacity-60">
                              {categoryName}
                            </span>
                            <span className="font-medium leading-tight transition-colors group-hover/item:text-foreground">
                              {topic}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => openBooking(course.title, 'بطاقة الدورة')}
            className="btn-premium flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_14px_36px_-10px_var(--shadow-primary-glow)] transition-all duration-300 ease-out hover:bg-primary-hover active:scale-[0.98]"
          >
            احجز مقعدك الآن
            <MessageCircle size={16} />
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onShare}
              aria-label="مشاركة الدورة"
              className="group/share rounded-2xl border border-brand-subtle bg-card p-3 text-muted-foreground transition-all hover:bg-primary/5"
            >
              <Share2 size={13} className="text-primary transition-transform group-hover/share:scale-110" />
            </button>

            <button
              type="button"
              onClick={onAsk}
              className="group/ask flex flex-[2] items-center justify-center gap-1.5 rounded-2xl border border-brand-subtle bg-card py-3 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary/5"
            >
              <MessageCircleQuestion size={13} className="text-secondary transition-transform group-hover/ask:scale-110" />
              اسأل المساعد الذكي
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[9px] font-extrabold uppercase tracking-[0.3em] transition-all duration-300',
              isExpanded
                ? 'bg-brand-dark text-white shadow-xl dark:bg-cream dark:text-brand-dark'
                : 'border border-brand-subtle bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground'
            )}
          >
            {isExpanded ? 'إخفاء التفاصيل' : 'عرض المحاور'}
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.4 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface AskTrainerModalProps {
  course: Course | null;
  question: string;
  onQuestionChange: (q: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function AskTrainerModal({
  course, question, onQuestionChange, onClose, onSubmit,
}: AskTrainerModalProps) {
  return (
    <AnimatePresence>
      {course && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md dark:bg-black/50"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-title"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-subtle bg-card shadow-2xl"
          >
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary/10 p-2.5 text-secondary">
                    <MessageCircleQuestion size={24} />
                  </div>
                  <div>
                    <h3 id="ask-title" className="text-lg font-extrabold uppercase tracking-tight text-foreground">
                      اسأل المساعد الذكي
                    </h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      بخصوص: {course.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق نافذة السؤال"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <label htmlFor="ask-textarea" className="sr-only">
                  سؤالك
                </label>
                <textarea
                  id="ask-textarea"
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder="اكتب سؤالك هنا بخصوص هذه الدورة..."
                  className="h-32 w-full resize-none rounded-2xl border border-brand-subtle bg-page p-5 text-right text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/25"
                  dir="rtl"
                />

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!question.trim()}
                  className="btn-premium flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_14px_36px_-10px_var(--shadow-primary-glow)] transition-all hover:bg-primary-hover disabled:scale-100 disabled:opacity-50"
                >
                  إرسال السؤال للمساعد الذكي
                  <Send size={16} />
                </button>

                <p className="text-center text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  سيتم الرد عليك فوراً بواسطة مساعدنا الذكي في نافذة المحادثة
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
