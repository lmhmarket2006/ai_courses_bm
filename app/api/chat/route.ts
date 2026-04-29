import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { CHAT_CONFIG } from '@/lib/config';
import { buildSystemPrompt } from '@/lib/system-prompt';
import { checkRateLimit, getClientIp, getRateLimitMessage } from '@/lib/rate-limit';
import { isAllowedOrigin } from '@/lib/csrf';

/**
 * نقطة نهاية الدردشة (Server-Side).
 *
 * طبقات الحماية بالترتيب:
 *  ١. CSRF check (Origin/Referer) → 403 إذا فشل.
 *  ٢. Rate Limiting بثلاث طبقات (burst/minute/hour) → 429 إذا فشل.
 *  ٣. Validation صارم لشكل البيانات → 400 إذا فشل.
 *  ٤. التأكد من وجود GEMINI_API_KEY → 500 إذا غاب.
 *  ٥. Streaming Response لتحسين زمن أوّل رمز.
 */

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────────────────
//  أنواع البيانات
// ─────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  message: string;
  conversationId?: string;
  /** عدد رسائل المستخدم في الجلسة مع احتساب الرسالة الحالية (يبدأ من 1) — يُمرَّر للـ system prompt */
  userTurnNumber?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validation صارم للحماية من حقن JSON تالف أو طلبات بحقول مفقودة. */
function validateRequest(body: unknown): ChatRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  if (typeof b.message !== 'string' || b.message.trim().length === 0) return null;
  if (b.message.length > 4000) return null;

  if (b.conversationId !== undefined) {
    if (typeof b.conversationId !== 'string' || !UUID_REGEX.test(b.conversationId)) return null;
  }

  if (!Array.isArray(b.messages)) return null;
  if (b.messages.length > 200) return null;
  for (const m of b.messages) {
    if (!m || typeof m !== 'object') return null;
    const mm = m as Record<string, unknown>;
    if (mm.role !== 'user' && mm.role !== 'model') return null;
    if (typeof mm.text !== 'string') return null;
    if (mm.text.length > 4000) return null;
  }

  if (b.userTurnNumber !== undefined) {
    if (typeof b.userTurnNumber !== 'number' || !Number.isInteger(b.userTurnNumber)) return null;
    if (b.userTurnNumber < 1 || b.userTurnNumber > 500) return null;
  }

  return b as unknown as ChatRequest;
}

// ─────────────────────────────────────────────────────────────────────────
//  دوال إنشاء الردود الموحّدة
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
  // ─── (١) CSRF Check ───
  if (!isAllowedOrigin(req.headers)) {
    return jsonError('Origin غير مصرّح به.', 403);
  }

  // ─── (٢) Rate Limiting ───
  const ip = getClientIp(req.headers);

  let rl;
  try {
    rl = await checkRateLimit(ip);
  } catch (err) {
    // فشل اتصال Upstash أو غياب البيئة — نُسجّل ونمنع الطلب كإجراء آمن.
    console.error('[chat] rate-limit error:', err);
    return jsonError('خدمة الحماية غير متوفرة حالياً. يرجى المحاولة لاحقاً.', 503);
  }

  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: getRateLimitMessage(rl.scope),
        retryAfter,
        scope: rl.scope,
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

  // ─── (٣) Validation ───
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('JSON غير صالح.', 400);
  }

  const validated = validateRequest(body);
  if (!validated) {
    return jsonError('البيانات المرسلة ناقصة أو غير صحيحة.', 400);
  }

  const { messages, message, userTurnNumber } = validated;
  const turn = typeof userTurnNumber === 'number' ? userTurnNumber : messages.filter((m) => m.role === 'user').length + 1;

  // ─── (٤) فحص المفتاح ───
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError('GEMINI_API_KEY غير مُعرَّف على الخادم.', 500);
  }

  // ─── (٥) استدعاء Gemini مع Streaming ───
  try {
    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: CHAT_CONFIG.model,
      history: messages.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      config: {
        maxOutputTokens: CHAT_CONFIG.maxOutputTokens,
        temperature: CHAT_CONFIG.temperature,
        systemInstruction: buildSystemPrompt(turn),
      },
    });

    const stream = await chat.sendMessageStream({ message });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error('[chat] streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset),
      },
    });
  } catch (err) {
    console.error('[chat] gemini error:', err);
    return jsonError('تعذّر الاتصال بمساعدنا الذكي حالياً.', 502);
  }
}
