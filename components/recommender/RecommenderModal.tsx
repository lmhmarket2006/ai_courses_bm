'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useRecommender } from '@/hooks/use-recommender';
import Quiz from './Quiz';
import Result from './Result';

interface RecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * مكوّن Recommender الكامل (modal + كل الحالات).
 *
 * يلفّ جميع مراحل الاستبيان في modal واحد:
 *  - Quiz: عرض الأسئلة بالتسلسل.
 *  - Loading: شاشة "Gemini يحلّل..."
 *  - Result: بطاقة التوصية.
 *  - Error / Rate-Limited: رسائل ودودة مع إعادة المحاولة.
 */
export default function RecommenderModal({ isOpen, onClose }: RecommenderModalProps) {
  const {
    phase,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    start,
    close,
    answerCurrent,
    goBack,
    restart,
  } = useRecommender();

  // عند فتح الـ modal لأول مرة، ابدأ الاستبيان تلقائياً.
  useEffect(() => {
    if (isOpen && phase.kind === 'idle') {
      start();
    }
  }, [isOpen, phase.kind, start]);

  // عند إغلاق الـ modal من الخارج، نظّف الحالة.
  const handleClose = () => {
    close();
    onClose();
  };

  // قفل تمرير الصفحة خلف الـ modal
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-brand-dark/65 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommender-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-brand-subtle bg-card shadow-2xl md:rounded-[2.5rem]"
          >
            {/* رأس الـ modal */}
            <div className="flex items-center justify-between gap-4 border-b border-brand-subtle bg-linear-to-r from-cream to-card px-6 py-4 dark:from-brand-dark-surface md:px-8 md:py-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 md:w-10 md:h-10 logo-gradient rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="recommender-title"
                    className="truncate text-sm font-black leading-tight text-foreground md:text-base"
                  >
                    أي دورة تناسبك؟
                  </h2>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground md:text-[10px]">
                    استبيان ذكي بـ Gemini
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="إغلاق"
                className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* المحتوى الديناميكي حسب المرحلة */}
            <div className="flex-1 overflow-hidden">
              {phase.kind === 'quiz' && currentQuestion && (
                <Quiz
                  question={currentQuestion}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={totalQuestions}
                  onAnswer={answerCurrent}
                  onBack={goBack}
                  canGoBack={currentQuestionIndex > 0}
                />
              )}

              {phase.kind === 'loading' && <LoadingState />}

              {phase.kind === 'result' && (
                <Result
                  recommendation={phase.recommendation}
                  onClose={handleClose}
                  onRestart={restart}
                />
              )}

              {phase.kind === 'error' && (
                <ErrorState message={phase.message} onRetry={restart} />
              )}

              {phase.kind === 'rate-limited' && (
                <RateLimitedState message={phase.message} retryAfterSec={phase.retryAfterSec} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  حالات فرعية
// ─────────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 logo-gradient rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl"
      >
        <Sparkles size={28} />
      </motion.div>
      <h3 className="mb-2 text-xl font-black text-foreground">جاري تحليل إجاباتك...</h3>
      <p className="max-w-sm text-sm font-medium text-muted-foreground">
        مساعدنا الذكي يدرس إجاباتك ويختار الدورة الأنسب لك من بين دوراتنا.
      </p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="h-2 w-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center min-h-[400px]">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle size={28} />
      </div>
      <h3 className="mb-2 text-xl font-black text-foreground">حدث خطأ غير متوقع</h3>
      <p className="mb-6 max-w-sm text-sm font-medium text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-3 logo-gradient text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-xl"
      >
        إعادة الاستبيان
      </button>
    </div>
  );
}

function RateLimitedState({ message, retryAfterSec }: { message: string; retryAfterSec: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center min-h-[400px]">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
        <Clock size={28} />
      </div>
      <h3 className="mb-2 text-xl font-black text-foreground">طلباتك متسارعة جداً 😅</h3>
      <p className="mb-2 max-w-sm text-sm font-medium text-muted-foreground">{message}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        المتاح خلال: {retryAfterSec} ثانية
      </p>
    </div>
  );
}
