import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest } from 'next/server';
import { CHAT_CONFIG } from '@/lib/config';
import {
  QUIZ_QUESTIONS,
  buildRecommendationPrompt,
  validateRecommendation,
  type QuizAnswers,
} from '@/lib/recommender';
import { checkRateLimit, getClientIp, getRateLimitMessage } from '@/lib/rate-limit';
import { isAllowedOrigin } from '@/lib/csrf';
import { parseModelJson } from '@/lib/parse-model-json';

/**
 * نقطة نهاية التوصية الذكية بالدورات.
 *
 * تأخذ إجابات المستخدم على ٦ أسئلة، وتُرجع JSON منظّم يحوي معرّف الدورة
 * الموصى بها + شرحاً تحفيزياً + بدائل.
 *
 * تستخدم Gemini Structured Output (responseSchema + enum) لضمان أن
 * النموذج لا يخترع دورات غير موجودة.
 *
 * طبقات الحماية: CSRF → Rate Limit → Validation → Gemini → Validation للنتيجة.
 */

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────────────────
//  Validation للطلب الوارد
// ─────────────────────────────────────────────────────────────────────────

interface RecommendRequest {
  answers: QuizAnswers;
}

function validateRequest(body: unknown): RecommendRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  if (!b.answers || typeof b.answers !== 'object') return null;
  const answers = b.answers as Record<string, unknown>;

  // كل سؤال في الـ quiz يجب أن يكون مُجاباً عليه بقيمة صحيحة من خياراته.
  for (const q of QUIZ_QUESTIONS) {
    const ans = answers[q.id];
    if (typeof ans !== 'string') return null;
    if (!q.options.some((o) => o.id === ans)) return null;
  }

  return { answers: answers as QuizAnswers };
}

// ─────────────────────────────────────────────────────────────────────────
//  دوال إنشاء الردود
// ─────────────────────────────────────────────────────────────────────────

function jsonError(message: string, status: number, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─────────────────────────────────────────────────────────────────────────
//  المعالج الرئيسي
// ─────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // (١) CSRF Check
  if (!isAllowedOrigin(req.headers)) {
    return jsonError('Origin غير مصرّح به.', 403);
  }

  // (٢) Rate Limiting
  const ip = getClientIp(req.headers);
  let rl;
  try {
    rl = await checkRateLimit(ip);
  } catch (err) {
    console.error('[recommend] rate-limit error:', err);
    return jsonError('خدمة الحماية غير متوفرة حالياً.', 503);
  }

  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: getRateLimitMessage(rl.scope),
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset),
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  // (٣) Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('JSON غير صالح.', 400);
  }

  const validated = validateRequest(body);
  if (!validated) {
    return jsonError('إجابات الاستبيان ناقصة أو غير صحيحة.', 400);
  }

  // (٤) فحص المفتاح
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError('GEMINI_API_KEY غير مُعرَّف على الخادم.', 500);
  }

  // (٥) استدعاء Gemini مع Structured Output
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildRecommendationPrompt(validated.answers);

    // SDK v1: نستخدم Type enum بدلاً من strings لأمان أعلى
    const courseIds = (await import('@/lib/courses')).COURSES.map((c) => c.id);

    const response = await ai.models.generateContent({
      model: CHAT_CONFIG.model,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCourseId: {
              type: Type.STRING,
              enum: courseIds,
              description: 'معرّف الدورة الأنسب من القائمة',
            },
            confidence: {
              type: Type.STRING,
              enum: ['high', 'medium', 'low'],
            },
            reasoning: {
              type: Type.STRING,
              description: 'شرح عربي تحفيزي ٢-٤ أسطر',
            },
            alternatives: {
              type: Type.ARRAY,
              maxItems: 2,
              items: {
                type: Type.OBJECT,
                properties: {
                  courseId: { type: Type.STRING, enum: courseIds },
                  reason: { type: Type.STRING },
                },
                required: ['courseId', 'reason'],
                propertyOrdering: ['courseId', 'reason'],
              },
            },
          },
          required: ['recommendedCourseId', 'confidence', 'reasoning', 'alternatives'],
          propertyOrdering: ['recommendedCourseId', 'confidence', 'reasoning', 'alternatives'],
        },
      },
    });

    const text = response.text;
    if (!text?.trim()) {
      return jsonError('لم نتمكّن من توليد توصية. يرجى المحاولة مرة أخرى.', 502);
    }

    let parsed: unknown;
    try {
      parsed = parseModelJson(text);
    } catch (e) {
      const preview = text.length > 400 ? `${text.slice(0, 400)}…` : text;
      console.error('[recommend] JSON parse failed:', e, preview);
      return jsonError('استجابة غير صالحة من المساعد. يرجى المحاولة لاحقاً.', 502);
    }

    const recommendation = validateRecommendation(parsed);
    if (!recommendation) {
      console.error('[recommend] validation failed:', parsed);
      return jsonError('التوصية لم تجتز الفحوصات. يرجى المحاولة لاحقاً.', 502);
    }

    return new Response(JSON.stringify(recommendation), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    });
  } catch (err) {
    console.error('[recommend] gemini error:', err);
    return jsonError('تعذّر الاتصال بخدمة التوصية حالياً.', 502);
  }
}
