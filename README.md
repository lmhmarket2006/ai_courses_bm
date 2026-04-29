<div align="center">

# 📸 أكاديمية بيت المصور

**Baytalmosawer Academy**

منصة تعليمية فاخرة لنخبة المصورين، مع مساعد ذكي بـ Google Gemini.

</div>

---

## 🇸🇦 نظرة عامة

تطبيق ويب بـ **Next.js 15** و **React 19** يعرض دورات أكاديمية تصوير عربية، ويتضمّن:

- ✨ صفحة هبوط فاخرة بتصميم RTL وخط `Almarai`.
- 🤖 مساعد ذكي مدعوم بـ **Google Gemini** يعمل بالـ Streaming.
- 📚 شبكة دورات تفاعلية مع نوافذ "اسأل المدرب" و"مشاركة".
- 💬 ربط مباشر بالواتساب للحجز.
- 🎨 رسوم متحركة سلسة بـ `motion/react`.
- ♿ Accessibility (ARIA labels, keyboard nav, contrast).
- 🔒 مفاتيح API محفوظة على الخادم فقط (server-side).

## 🏗️ الهيكلية

```
.
├── app/
│   ├── api/chat/route.ts    ← Gemini API (Server-side, Streaming)
│   ├── error.tsx            ← Error Boundary للمسار
│   ├── loading.tsx          ← شاشة تحميل
│   ├── not-found.tsx        ← صفحة 404
│   ├── layout.tsx           ← Layout + SEO + Toast Provider
│   └── page.tsx             ← الصفحة الرئيسية
│
├── components/
│   ├── share/ShareModal.tsx ← مكوّن مشاركة مشترك
│   ├── ui/Toast.tsx         ← نظام Toasts
│   ├── AnimatedBackground.tsx
│   ├── ChatBot.tsx          ← UI فقط، يستخدم useChat
│   ├── CourseDetailsSection.tsx
│   ├── CourseList.tsx
│   ├── FeaturedCourses.tsx
│   ├── Header.tsx
│   └── TrustSections.tsx    ← Stats + Testimonials + FAQ
│
├── hooks/
│   ├── use-chat.ts          ← منطق الدردشة + localStorage
│   └── use-mobile.ts        ← كشف الجوال (متاح للاستخدام)
│
├── lib/
│   ├── config.ts            ← إعدادات مركزية (هوية، تواصل، حدود)
│   ├── courses.ts           ← بيانات الدورات + Testimonials + FAQ
│   ├── share.ts             ← منطق المشاركة على الشبكات
│   ├── system-prompt.ts     ← تعليمات Gemini (تُبنى من البيانات)
│   ├── topic-display.tsx    ← أيقونات/تصنيف المحاور
│   ├── utils.ts             ← cn() لدمج classes
│   └── whatsapp.ts          ← دالة buildBookingUrl موحّدة
│
├── .env.example             ← قالب المتغيّرات البيئية
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 20+
- مفتاح Gemini API ([احصل عليه مجاناً](https://aistudio.google.com/app/apikey))

### الخطوات

```bash
# 1) نسخ ملف البيئة وتعبئته
cp .env.example .env.local
# افتح .env.local وضع GEMINI_API_KEY الخاص بك

# 2) تثبيت المكتبات
npm install

# 3) تشغيل وضع التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## 📜 السكربتات المتاحة

| السكربت | الوظيفة |
|---------|---------|
| `npm run dev` | وضع التطوير مع HMR |
| `npm run build` | بناء للإنتاج |
| `npm run start` | تشغيل بناء الإنتاج |
| `npm run lint` | فحص ESLint |
| `npm run lint:fix` | إصلاح أخطاء ESLint تلقائياً |
| `npm run typecheck` | فحص أنواع TypeScript |
| `npm run clean` | تنظيف `.next` و الكاش |

## 🔐 الأمان

- ✅ `GEMINI_API_KEY` يُقرَأ على الخادم فقط (داخل `app/api/chat/route.ts`).
- ❌ **لا تستخدم** البادئة `NEXT_PUBLIC_` مع المفاتيح السرية.
- ✅ التحقّق من شكل البيانات (validation) قبل إرسالها لـ Gemini.
- ✅ رؤوس HTTP أمنية (X-Frame-Options، Permissions-Policy...) في `next.config.ts`.
- ✅ **Rate Limiting** متعدّد الطبقات (٢٠/د، ١٠٠/س، ٥٠٠/ي) لكل IP، و٣٠ رسالة كحد للمحادثة، و٥ دقائق idle.

## ⚡ Rate Limiting & Upstash Redis

النظام يدعم تلقائياً وضعين:

| البيئة | الوضع | السلوك |
|--------|-------|--------|
| **dev محلي** بدون Upstash env | In-memory | يعمل فوراً، لا حاجة لإنترنت، لكن لا يصمد أمام إعادة التشغيل |
| **dev محلي** مع Upstash env | Upstash Redis | حالة دائمة، يصمد بين إعادة التشغيل، يحاكي الإنتاج |
| **إنتاج** بدون Upstash env | In-memory | ⚠️ غير موصى به في multi-instance |
| **إنتاج** مع Upstash env | Upstash Redis | ✅ **موصى به** — حالة مشتركة بين كل instances و regions |

### ربط Upstash (5 دقائق)

1. سجّل في [console.upstash.com](https://console.upstash.com) (مجاناً، ١٠٠٠ طلب/يوم).
2. أنشئ Database من نوع **Redis** (اختر أقرب region لجمهورك، مثلاً `eu-west-1`).
3. افتح الـ Database → تبويب **REST API** → انسخ القيمتين:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AYx...
   ```
4. ضعهما في `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL="https://xxx-xxx.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AYx..."
   ```
5. أعد تشغيل `npm run dev`. ستُلاحظ في اللوج:
   ```
   [rate-limit] mode = upstash-redis
   ```
6. عند النشر على Vercel/Cloud Run: أضف نفس المتغيّرين في إعدادات البيئة.

### اختبار سريع

```bash
# أرسل ٢١ طلب متتالي وستحصل على 429 في الطلب الأخير
for ($i=1; $i -le 21; $i++) { curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{`"conversationId`":`"00000000-0000-4000-8000-000000000000`",`"messages`":[],`"message`":`"test $i`"}" -w "`n%{http_code}`n" }
```

## 🧱 المعمارية

### تدفّق رسالة في الشات

```
ChatBot (UI)
    │
    ▼
useChat (hook)
    │  fetch /api/chat (POST)
    ▼
app/api/chat/route.ts (Server)
    │  Validate → buildSystemPrompt() → GoogleGenAI.sendMessageStream
    ▼
ReadableStream (text chunks)
    │
    ▼
useChat يحدّث الرسالة chunk-by-chunk
    │
    ▼
ChatBot يعرض الكتابة الحيّة + يخزّن في localStorage
```

### مبادئ التصميم
1. **Single Source of Truth** — كل المعلومات (تواصل، إحصاءات، ألوان) في `lib/config.ts`.
2. **Separation of Concerns** — UI في `components/`، منطق في `hooks/`، خدمات في `lib/`.
3. **No Code Duplication** — `getTopicDisplay`، `ShareModal`، أدوات الواتساب كلها مشتركة.
4. **Server-only secrets** — أي مفتاح API لا يصل أبداً للمتصفح.

## 🎨 الهوية البصرية

| اللون | HEX | الاستخدام |
|-------|-----|-----------|
| Primary | `#1e1e8a` | أزرار ثانوية، headings |
| Secondary | `#76258f` | روابط، نصوص ثانوية |
| Accent | `#c21e3c` | CTA الرئيسي |
| Background | `#FAF9F6` | خلفية افتراضية |

تُعدَّل من `lib/config.ts` و `app/globals.css`.

## 🛣️ خارطة الميزات المقترحة

- [ ] **CMS بسيط:** ربط الدورات بـ Sanity أو Contentlayer لتعديلها بدون كود.
- [ ] **نظام تسجيل وتدفّع:** Stripe أو Tap Payments + Supabase Auth.
- [ ] **معرض أعمال (Portfolio):** صفحة `/portfolio` لعرض إنجازات المتدرّبين.
- [ ] **بحث صوتي:** ميكروفون داخل الشات يحوّل الصوت إلى نص.
- [ ] **توصية ذكية:** "أي دورة تناسبني؟" — استبيان قصير يقترح دورة عبر Gemini.
- [ ] **Sitemap & Robots:** `app/sitemap.ts` و `app/robots.ts`.
- [ ] **Analytics:** تكامل Vercel Analytics أو Plausible.
- [ ] **اختبارات:** Vitest + Playwright لاختبارات E2E.
- [ ] **Dark Mode:** بإضافة `next-themes` وعمل تباين.
- [ ] **Rate Limiting:** على `/api/chat` بـ Upstash Redis.

## 📝 الترخيص

ملكية فكرية محفوظة لأكاديمية بيت المصور © 2026.

---

<details>
<summary>🇬🇧 English Quick Start</summary>

This is a Next.js 15 + React 19 application for an Arabic photography academy with a Google Gemini-powered chatbot.

```bash
cp .env.example .env.local   # add your GEMINI_API_KEY
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Important:** the API key is **server-only** — never use `NEXT_PUBLIC_` prefix.

</details>
