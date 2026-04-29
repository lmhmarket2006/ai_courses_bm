/**
 * فحص CSRF بسيط بناءً على Origin / Referer.
 *
 * هذه ليست حماية CSRF كاملة (لا تستخدم Tokens)، لكنها كافية لـ:
 *  - منع المواقع الأخرى من استدعاء API الخاص بنا من المتصفح.
 *  - منع طلبات غير عادية من Postman/cURL في الإنتاج.
 *
 * في حال الحاجة لحماية أقوى لاحقاً (مثلاً عند إضافة Auth وعمليات تعديل البيانات):
 *  - أضف Double-Submit Cookie أو SameSite Cookie + Origin check.
 *  - أو استخدم مكتبة edge middleware للحماية على مستوى الشبكة.
 */

/**
 * يبني قائمة الـ Origins المسموح بها بناءً على البيئة.
 *
 *  - في dev: يُسمح بـ localhost على المنفذين الافتراضيين.
 *  - في prod: يُسمح فقط بـ NEXT_PUBLIC_SITE_URL (يُعدَّل من ENV).
 */
function getAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();

  if (process.env.NODE_ENV !== 'production') {
    // Next.js قد يستخدم منفذ آخر إذا كان 3000 مشغولاً — نسمح بأي منفذ على localhost.
    for (let p = 3000; p <= 3010; p++) {
      allowed.add(`http://localhost:${p}`);
      allowed.add(`http://127.0.0.1:${p}`);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const u = new URL(siteUrl);
      allowed.add(u.origin);
    } catch {
      console.warn('[csrf] NEXT_PUBLIC_SITE_URL غير صالح:', siteUrl);
    }
  }

  return allowed;
}

/**
 * يفحص ما إذا كان مصدر الطلب موثوقاً.
 *
 * المنطق:
 *  1. يحاول قراءة Origin → إن وُجد، يقارنه بقائمة المسموح بها.
 *  2. إن غاب Origin، يحاول استخراج Origin من Referer.
 *  3. إن غاب الاثنان → يرفض في الإنتاج، يقبل في التطوير (Postman/cURL).
 *
 * @returns true إن كان الطلب من مصدر مصرّح به
 */
export function isAllowedOrigin(headers: Headers): boolean {
  const origin = headers.get('origin');
  const referer = headers.get('referer');

  let candidate: string | null = null;

  if (origin) {
    candidate = origin;
  } else if (referer) {
    try {
      candidate = new URL(referer).origin;
    } catch {
      candidate = null;
    }
  }

  if (!candidate) {
    // لا Origin ولا Referer — نسمح فقط في dev (لأدوات الاختبار).
    return process.env.NODE_ENV !== 'production';
  }

  if (getAllowedOrigins().has(candidate)) return true;

  // في التطوير: نفس الجهاز على IP الشبكة المحلية (مثلاً اختبار من الهاتف على 192.168.x.x:3000)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const u = new URL(candidate);
      const { hostname } = u;
      if ((hostname === 'localhost' || hostname === '127.0.0.1') && (u.protocol === 'http:' || u.protocol === 'https:')) {
        return true;
      }
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    } catch {
      return false;
    }
  }

  return false;
}
