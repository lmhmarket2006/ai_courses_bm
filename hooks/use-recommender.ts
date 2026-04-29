'use client';

import { useCallback, useState } from 'react';
import { QUIZ_QUESTIONS, type QuizAnswers, type Recommendation } from '@/lib/recommender';

/**
 * حالة الـ Recommender:
 *  - idle: لم يُفتح الاستبيان بعد
 *  - quiz: المستخدم يجيب على الأسئلة
 *  - loading: نُحمّل التوصية من Gemini
 *  - result: عرض النتيجة
 *  - error: فشل في الاستدعاء
 *  - rate-limited: تجاوز الحدود مؤقتاً
 */
export type RecommenderPhase =
  | { kind: 'idle' }
  | { kind: 'quiz' }
  | { kind: 'loading' }
  | { kind: 'result'; recommendation: Recommendation; answers: QuizAnswers }
  | { kind: 'error'; message: string }
  | { kind: 'rate-limited'; message: string; retryAfterSec: number };

/**
 * Hook لإدارة استبيان التوصية الذكية بالكامل.
 *
 * يفصل المنطق عن الـ UI ليسهل الاختبار وإعادة الاستخدام.
 */
export function useRecommender() {
  const [phase, setPhase] = useState<RecommenderPhase>({ kind: 'idle' });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /** يبدأ استبياناً جديداً من البداية. */
  const start = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPhase({ kind: 'quiz' });
  }, []);

  /** يُغلق الـ Recommender ويعيد كل شيء للحالة الأصلية. */
  const close = useCallback(() => {
    setPhase({ kind: 'idle' });
    setAnswers({});
    setCurrentQuestionIndex(0);
  }, []);

  /**
   * يحفظ الإجابة وينتقل للسؤال التالي.
   * عند آخر سؤال، يُرسل الإجابات للخادم.
   */
  const answerCurrent = useCallback(
    async (answerId: string) => {
      const question = QUIZ_QUESTIONS[currentQuestionIndex];
      if (!question) return;

      const updatedAnswers = { ...answers, [question.id]: answerId };
      setAnswers(updatedAnswers);

      // ليس آخر سؤال — انتقل للتالي
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
        return;
      }

      // آخر سؤال — أرسل للخادم
      setPhase({ kind: 'loading' });

      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers }),
        });

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          setPhase({
            kind: 'rate-limited',
            message: data.message ?? 'تم تجاوز الحد المسموح.',
            retryAfterSec: data.retryAfter ?? 60,
          });
          return;
        }

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          const serverMsg =
            typeof data.error === 'string' && data.error.length > 0
              ? data.error
              : res.status === 403
                ? 'تم رفض الطلب (مصدر غير مصرّح). تأكد من فتح الموقع من نفس العنوان المسجّل في الإعدادات.'
                : `تعذّر إكمال الطلب (${res.status}).`;
          throw new Error(serverMsg);
        }

        const recommendation = (await res.json()) as Recommendation;
        setPhase({ kind: 'result', recommendation, answers: updatedAnswers });
      } catch (err) {
        console.error('[useRecommender]', err);
        const msg = err instanceof Error && err.message ? err.message : 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
        setPhase({
          kind: 'error',
          message: msg,
        });
      }
    },
    [answers, currentQuestionIndex]
  );

  /** يعود سؤال للخلف. */
  const goBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  /** يُعيد الاستبيان من البداية (يُستخدَم بعد عرض النتيجة). */
  const restart = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPhase({ kind: 'quiz' });
  }, []);

  return {
    phase,
    answers,
    currentQuestion: QUIZ_QUESTIONS[currentQuestionIndex] ?? null,
    currentQuestionIndex,
    totalQuestions: QUIZ_QUESTIONS.length,
    start,
    close,
    answerCurrent,
    goBack,
    restart,
  };
}
