import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Rate Limiter ثلاثي الطبقات لكل IP.
 *
 * استراتيجية الحماية:
 *  • Burst (10 طلب / 10 ثوانٍ) → يصدّ الهجمات السريعة المتفجّرة.
 *  • Minute (20 طلب / 60 ثانية) → يحدّ الاستخدام المكثّف لمستخدم عادي.
 *  • Hour (100 طلب / 3600 ثانية) → سقف يومي تقريبي يحمي حصة Gemini API.
 *
 * تستخدم Upstash Redis بـ Sliding Window — حالة مشتركة بين كل instances و regions.
 *
 * تنفيذ Lazy: لا يتصل بـ Redis إلا عند أول استدعاء، فلا يُعطّل البناء (build)
 * في حال غياب متغيّرات البيئة. يُلقي خطأً واضحاً في وقت الطلب فقط.
 */

// ─────────────────────────────────────────────────────────────────────────
//  أنواع البيانات العامة
// ─────────────────────────────────────────────────────────────────────────

export type RateLimitScope = 'burst' | 'minute' | 'hour';

export interface RateLimitResult {
  /** هل الطلب مسموح به */
  success: boolean;
  /** سقف النافذة التي تم الفحص بها (الأكثر صرامة عند النجاح، أو التي رفضت عند الفشل) */
  limit: number;
  /** عدد الطلبات المتبقية في النافذة المُشار إليها بـ limit */
  remaining: number;
  /** Timestamp بالميلي ثانية لانتهاء النافذة وبدء عداد جديد */
  reset: number;
  /** أي نافذة فُرض الحد منها (يفيد لرسالة الخطأ والتشخيص) */
  scope: RateLimitScope;
}

// ─────────────────────────────────────────────────────────────────────────
//  تهيئة Redis والمحدّدات بشكل Lazy
// ─────────────────────────────────────────────────────────────────────────

interface Limiters {
  burst: Ratelimit;
  minute: Ratelimit;
  hour: Ratelimit;
}

let cachedLimiters: Limiters | null = null;

function getLimiters(): Limiters {
  if (cachedLimiters) return cachedLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN مطلوبتان. أضفهما في .env.local من https://console.upstash.com'
    );
  }

  const redis = new Redis({ url, token });

  cachedLimiters = {
    burst: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      prefix: 'baytalmosawer:rl:burst',
      analytics: false,
    }),
    minute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      prefix: 'baytalmosawer:rl:minute',
      analytics: false,
    }),
    hour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '3600 s'),
      prefix: 'baytalmosawer:rl:hour',
      analytics: false,
    }),
  };

  return cachedLimiters;
}

// ─────────────────────────────────────────────────────────────────────────
//  الواجهة العامة
// ─────────────────────────────────────────────────────────────────────────

/**
 * يفحص ما إذا كان طلب من هذا الـ IP مسموحاً به.
 *
 * يُجرى الفحص بترتيب: burst → minute → hour. عند فشل أي طبقة، يتوقف الفحص
 * فوراً ويرجع نتيجة تلك الطبقة (مع scope محدّد).
 *
 * مهم: استدعاء `.limit()` يزيد العدّاد فعلياً، لذا كل استدعاء لـ `checkRateLimit`
 * يُعدّ كطلب واحد. لا تستدعها مرتين لنفس الطلب.
 *
 * @param ip - عنوان IP الزائر (يُستخرج من رؤوس الطلب عبر `getClientIp`)
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const limiters = getLimiters();

  const burst = await limiters.burst.limit(ip);
  if (!burst.success) {
    return {
      success: false,
      limit: burst.limit,
      remaining: burst.remaining,
      reset: burst.reset,
      scope: 'burst',
    };
  }

  const minute = await limiters.minute.limit(ip);
  if (!minute.success) {
    return {
      success: false,
      limit: minute.limit,
      remaining: minute.remaining,
      reset: minute.reset,
      scope: 'minute',
    };
  }

  const hour = await limiters.hour.limit(ip);
  if (!hour.success) {
    return {
      success: false,
      limit: hour.limit,
      remaining: hour.remaining,
      reset: hour.reset,
      scope: 'hour',
    };
  }

  // كل النوافذ نجحت — أرجع بيانات نافذة Burst (الأكثر صرامة) للعرض في الرؤوس.
  return {
    success: true,
    limit: burst.limit,
    remaining: burst.remaining,
    reset: burst.reset,
    scope: 'burst',
  };
}

/**
 * رسالة عربية ودودة بناءً على نوع النافذة المرفوضة.
 */
export function getRateLimitMessage(scope: RateLimitScope): string {
  switch (scope) {
    case 'burst':
      return 'طلباتك متسارعة جداً 😅 خفّف السرعة وجرّب بعد ١٠ ثوانٍ.';
    case 'minute':
      return 'لقد وصلت إلى الحد المسموح هذه الدقيقة (٢٠ طلب). الرجاء المحاولة بعد دقيقة.';
    case 'hour':
      return 'لقد وصلت إلى الحد المسموح لهذه الساعة (١٠٠ طلب). يرجى المحاولة لاحقاً.';
  }
}

/**
 * يستخرج عنوان IP من رؤوس الطلب بشكل آمن.
 * يفضّل `x-forwarded-for` (Vercel/Cloud Run يضعانه)، ثم `x-real-ip`.
 * في dev المحلي، النتيجة عادة "::1" أو "127.0.0.1" — هذا طبيعي.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
