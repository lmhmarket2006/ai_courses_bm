'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { QuizQuestion } from '@/lib/recommender';

interface QuizProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerId: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

/**
 * مكوّن سؤال واحد من الاستبيان.
 *
 * تصميم "swipe-style": سؤال كبير في المنتصف، أزرار إجابة كبيرة بدلاً من
 * radio buttons صغيرة. يحفّز على الـ engagement العالي مقارنة بـ form طويل.
 */
export default function Quiz({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onBack,
  canGoBack,
}: QuizProps) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* شريط التقدّم */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground">
            السؤال {questionIndex + 1} من {totalQuestions}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary">
            {Math.round(progress)}٪
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-page">
          <motion.div
            className="h-full logo-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* محتوى السؤال */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-6 md:px-12 py-8 md:py-12 overflow-y-auto"
        >
          <div className="max-w-xl mx-auto">
            <h3 className="mb-3 text-2xl font-black leading-tight tracking-tight text-foreground md:text-3xl">
              {question.prompt}
            </h3>
            {question.subtitle && (
              <p className="mb-8 text-sm font-medium text-muted-foreground">{question.subtitle}</p>
            )}

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => onAnswer(option.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-brand-subtle bg-page p-5 text-right transition-all hover:border-primary/30 hover:bg-card hover:shadow-xl hover:shadow-primary/10 md:p-6"
                >
                  <span className="text-base font-bold text-foreground transition-colors group-hover:text-primary md:text-lg">
                    {option.label}
                  </span>
                  <ChevronLeft
                    size={20}
                    className="shrink-0 text-muted-foreground transition-all group-hover:-translate-x-1 group-hover:text-primary"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* زر العودة */}
      {canGoBack && (
        <div className="px-8 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronRight size={14} />
            السؤال السابق
          </button>
        </div>
      )}
    </div>
  );
}
