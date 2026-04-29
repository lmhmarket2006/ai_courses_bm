/**
 * إعدادات الأكاديمية المركزية (Single Source of Truth).
 *
 * أي معلومة عن الأكاديمية (اسم، تواصل، شبكات، ألوان...) تُعدَّل من هنا فقط
 * ولا تُكرَّر في المكوّنات. هذا يجعل التغيير في مكان واحد ينعكس في كل الموقع.
 */

export const ACADEMY = {
  /** اسم الأكاديمية بالعربية */
  name: 'اكاديمية بيت  المصور',
  /** الاسم بالإنجليزية */
  nameEn: 'Baytalmosawer Academy',
  /** الوصف القصير (للـ SEO ووصف الموقع) */
  tagline: 'منصة تعليمية فاخرة لنخبة المصورين، تجمع بين الاحترافية والإبداع.',
  /** سنة التأسيس (لحساب سنوات الخبرة الديناميكية لاحقاً) */
  foundedYear: 2014,
} as const;

export const CONTACT = {
  /** رقم الواتساب الرسمي للحجز (مع +) */
  whatsapp: '+966533515176',
  /** رابط الإنستجرام */
  instagram: 'https://www.instagram.com/baytalmosawer?igsh=dWQ5eXdxMmJ3dDZz',
  /** البريد الإلكتروني (تركها فارغة يُخفي الزر) */
  email: '',
} as const;

/** خصم حصري يُذكر في الشات ويُربَط بعلياء (الحجوزات). */
export const DISCOUNT = {
  percent: 10,
  code: 'JOUD10',
  /** وصف قصير للعرض في الواجهة */
  tagline: 'لمستخدمي المساعد الذكي فقط',
} as const;

/** مساعد الشات — الاسم الظاهر للزائر. */
export const CHAT_ASSISTANT = {
  nameAr: 'جود',
  nameEn: 'Joud',
} as const;

/**
 * علياء — مسؤولة الحجوزات والأسعار النهائية.
 * أرقام التواصل تُستمد من CONTACT.
 */
export const BOOKINGS = {
  contactName: 'علياء',
  role: 'مسؤولة الحجوزات والدورات',
  /** نفس رقم الأكاديمية — للعرض في الرسائل */
  whatsapp: CONTACT.whatsapp,
  instagramHandle: 'baytalmosawer',
  /** يُطلب من الزائر أن يبدأ به رسالة الواتساب/الإنستجرام */
  messagePrefix: 'من المساعد الذكي - كود JOUD10',
} as const;

/**
 * أسعار تقريبية للشات فقط — السعر النهائي من علياء.
 * جميع الدورات حضوري ما عدا «التصوير بالجوال» (أونلاين).
 */
export const CHAT_PRICING_COURSES = [
  { icon: '📱', title: 'التصوير بالجوال', delivery: '🌐 أونلاين', priceApprox: '42$' },
  { icon: '📸', title: 'أساسيات التصوير', delivery: '🏫 حضوري', priceApprox: '800-1200 ر.س' },
  { icon: '🎨', title: 'التصوير الإبداعي', delivery: '🏫 حضوري', priceApprox: '1200-1800 ر.س' },
  { icon: '💡', title: 'الإضاءة الاحترافية', delivery: '🏫 حضوري', priceApprox: '1500-2000 ر.س' },
  { icon: '🎬', title: 'تصوير الفيديو', delivery: '🏫 حضوري', priceApprox: '1500-2500 ر.س' },
  { icon: '🖼️', title: 'تعديل الصور', delivery: '🏫 حضوري', priceApprox: '800-1200 ر.س' },
  { icon: '👤', title: 'التصوير الشخصي', delivery: '🏫 حضوري', priceApprox: '1200-1800 ر.س' },
  { icon: '🏆', title: 'الدورة الشاملة', delivery: '🏫 حضوري', priceApprox: '2500-3500 ر.س' },
] as const;

/** سطر واحد لكل دورة — للـ system prompt وللعرض. */
export function formatChatPricingLines(): string {
  return CHAT_PRICING_COURSES.map((c) => `${c.icon} ${c.title} | ${c.delivery} | ${c.priceApprox}`).join('\n');
}

/**
 * بيانات المدرب الرئيسي للأكاديمية.
 *
 * كل الدورات حالياً يقدّمها نفس المدرب. عند توسيع الفريق لاحقاً، حوّل
 * هذا الكائن إلى مصفوفة `INSTRUCTORS` واربط كل دورة بـ `instructorId`.
 */
export const INSTRUCTOR = {
  /** الاسم الكامل بالعربية */
  name: 'أحمد زغلول',
  /** الاسم بالإنجليزية (للـ SEO وعرضه في بعض السياقات) */
  nameEn: 'Ahmed Zaghloul',
  /** اللقب المهني — يظهر تحت الاسم */
  title: 'مصوّر ومدرب احترافي',
  /** نبذة قصيرة (٢-٣ أسطر) للعرض في بطاقة المدرب */
  bio: 'مدرب جميع دورات أكاديمية بيت المصور؛ خبرة طويلة في التصوير الفوتوغرافي والإضاءة والإخراج، يجمع بين المعرفة الأكاديمية والتطبيق الواقعي.',
  /** رابط الإنستجرام الشخصي للمدرب */
  instagram: 'https://www.instagram.com/zaghloulphotographer?igsh=ZXllcWwyazF6aGg4',
  /** اسم المستخدم بدون @ — يفيد للعرض النصي */
  instagramHandle: 'zaghloulphotographer',
} as const;

/**
 * إحصائيات الأكاديمية المعروضة في قسم Stats.
 * سُحبت من المكوّن إلى هنا لتسهيل التحديث.
 */
export const ACADEMY_STATS = {
  trainees: 50000,
  yearsOfExperience: 10,
  workshops: 500,
  positiveRating: 100,
} as const;

/**
 * أعداد الدورات المتاحة (تظهر في الـ Header).
 * يمكن جعلها ديناميكية لاحقاً بحساب COURSES.filter(...).length
 */
export const COURSE_AVAILABILITY = {
  online: 4,
  inPerson: 6,
} as const;

/**
 * ألوان الهوية البصرية (للاستخدام البرمجي في JS، أما في CSS فاستخدم متغيّرات globals.css).
 */
export const BRAND_COLORS = {
  primary: '#BE1622',
  secondary: '#1319B4',
  accent: '#590159',
  dark: '#010A2D',
  darkSurface: '#0A1030',
  background: '#FFFBF5',
  surface: '#ffffff',
} as const;

/**
 * إعدادات الـ Chatbot (تُقرأ من المتغيّرات البيئية مع قيم افتراضية آمنة).
 * ملاحظة: مفاتيح API لا تُعرَّف هنا — تبقى في server-side فقط.
 */
export const CHAT_CONFIG = {
  /** اسم الموديل المستخدم — يُعدَّل من ENV لتسهيل تجربة موديلات جديدة */
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  /** الحد الأقصى للtokens في كل رد */
  maxOutputTokens: 1024,
  /** درجة الإبداع 0-2 */
  temperature: 0.8,
  /** أقصى عدد رسائل تُحفظ في localStorage */
  historyLimit: 50,
  /** مفتاح التخزين المحلي */
  storageKey: 'baytalmosawer:chat-history',
} as const;

/**
 * حدود معدّل الاستخدام (Rate Limiting).
 *
 * ملاحظة: حدود IP الفعلية مُعرَّفة في `lib/rate-limit.ts` (Upstash Ratelimit)،
 * هذه القيم هنا توثيقية فقط لأي مرجع واجهة. حدّث كلا الموضعين معاً عند التغيير.
 *
 *  - **IP**: 3 نوافذ متتالية (burst 10 ثوانٍ / دقيقة / ساعة).
 *  - **المحادثة**: مُهلة خمول محلية فقط لإغلاق المحادثة من جهة العميل (UX).
 */
export const RATE_LIMITS = {
  ip: {
    burst: { windowMs: 10_000, max: 10, label: 'برست' },
    perMinute: { windowMs: 60_000, max: 20, label: 'دقيقة' },
    perHour: { windowMs: 60 * 60_000, max: 100, label: 'ساعة' },
  },
  conversation: {
    /** بعد هذا الزمن من الخمول، تنتهي المحادثة تلقائياً (5 دقائق) — محلي فقط */
    idleMs: 5 * 60_000,
  },
} as const;
