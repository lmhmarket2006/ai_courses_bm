import { COURSES, type Course } from './courses';
import { ACADEMY, INSTRUCTOR } from './config';

/**
 * نظام التوصية الذكي بالدورات.
 *
 * يأخذ إجابات المستخدم على ٦ أسئلة سريعة، ويرسلها لـ Gemini مع قائمة
 * الدورات الكاملة. Gemini يُلزَم بإرجاع JSON منظّم (Structured Output)
 * بمعرّف دورة من القائمة فقط — لا يستطيع اختراع دورة غير موجودة.
 */

// ─────────────────────────────────────────────────────────────────────────
//  الأسئلة (Single Source of Truth)
// ─────────────────────────────────────────────────────────────────────────

export type AnswerId = string;

export interface QuizOption {
  id: AnswerId;
  label: string;
  /** نص قصير يصف هذه الإجابة لـ Gemini (يساعد في الاستنتاج) */
  hint: string;
}

export interface QuizQuestion {
  id: string;
  /** السؤال المعروض للمستخدم */
  prompt: string;
  /** سؤال فرعي إيضاحي (اختياري) */
  subtitle?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'level',
    prompt: 'ما مستواك الحالي في التصوير؟',
    subtitle: 'كن صريحاً معنا — لا توجد إجابة خاطئة',
    options: [
      { id: 'beginner', label: 'مبتدئ تماماً', hint: 'لم يمسك كاميرا احترافية من قبل' },
      { id: 'intermediate', label: 'لدي معرفة بسيطة', hint: 'يفهم الأساسيات لكن يريد التعمق' },
      { id: 'advanced', label: 'محترف ويبحث عن التخصص', hint: 'يصور بشكل احترافي ويريد تخصصاً جديداً' },
    ],
  },
  {
    id: 'goal',
    prompt: 'ما هدفك من تعلم التصوير؟',
    options: [
      { id: 'hobby', label: 'هواية ومتعة شخصية', hint: 'يريد التصوير كشغف فقط' },
      { id: 'side-income', label: 'دخل إضافي بجانب عملي', hint: 'يبحث عن جلسات بدوام جزئي' },
      { id: 'career', label: 'احتراف كامل ومهنة', hint: 'يريد التصوير كمصدر دخل أساسي' },
    ],
  },
  {
    id: 'medium',
    prompt: 'أيّ مجال يجذبك أكثر؟',
    options: [
      { id: 'photo', label: 'التصوير الفوتوغرافي الثابت', hint: 'صور ساكنة' },
      { id: 'video', label: 'الفيديو والمونتاج', hint: 'محتوى متحرك' },
      { id: 'lighting', label: 'الإضاءة والاستوديو', hint: 'هندسة الضوء' },
      { id: 'mobile', label: 'التصوير بالجوال فقط', hint: 'بدون كاميرا احترافية' },
    ],
  },
  {
    id: 'specialty',
    prompt: 'ما التخصص الذي تتخيّل نفسك فيه؟',
    options: [
      { id: 'portrait', label: 'بورتريه وبيوتي', hint: 'صور شخصية ومكياج' },
      { id: 'wedding', label: 'أعراس ومناسبات', hint: 'توثيق اللحظات' },
      { id: 'product', label: 'منتجات وأطعمة', hint: 'تجاري وتسويقي' },
      { id: 'fashion', label: 'فاشن وأزياء', hint: 'مودلز وتنسيق' },
      { id: 'open', label: 'لم أحدّد بعد، أبحث عن أساس قوي', hint: 'يريد قاعدة عامة' },
    ],
  },
  {
    id: 'time',
    prompt: 'ما الوقت المتاح لديك للتعلم؟',
    options: [
      { id: 'short', label: 'بضعة أيام مكثفة', hint: 'يفضّل ورشة قصيرة مكثفة' },
      { id: 'flexible', label: 'مرن — أونلاين بوقتي', hint: 'يحتاج محتوى مسجّل' },
      { id: 'workshop', label: 'ورشة عمل متكاملة بالاستوديو', hint: 'يريد تطبيقاً عملياً مع مدرب' },
    ],
  },
  {
    id: 'budget',
    prompt: 'ما ميزانيتك التقريبية؟',
    options: [
      { id: 'low', label: 'أقل من ١٠٠٠ ر.س', hint: 'حساس جداً للسعر، يبحث عن قيمة' },
      { id: 'mid', label: '١٠٠٠ - ١٥٠٠ ر.س', hint: 'متوسط' },
      { id: 'high', label: 'أكثر من ١٥٠٠ ر.س', hint: 'مستعدّ للاستثمار في الجودة' },
      { id: 'flexible', label: 'مرنة — حسب القيمة', hint: 'يقرر بعد رؤية ما يحصل عليه' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
//  أنواع الإجابات والنتيجة
// ─────────────────────────────────────────────────────────────────────────

export type QuizAnswers = Record<string, AnswerId>;

export interface Recommendation {
  /** معرّف الدورة الموصى بها — يجب أن يكون واحداً من معرّفات COURSES */
  recommendedCourseId: string;
  /** ثقة Gemini في التوصية */
  confidence: 'high' | 'medium' | 'low';
  /** نص تحفيزي (٢-٣ أسطر) يشرح للمستخدم لماذا هذه الدورة */
  reasoning: string;
  /** بدائل مقترحة (٠-٢ دورات) */
  alternatives: Array<{ courseId: string; reason: string }>;
}

// ─────────────────────────────────────────────────────────────────────────
//  بناء الـ Prompt و Schema
// ─────────────────────────────────────────────────────────────────────────

/**
 * يبني نص الـ prompt الذي يُرسَل لـ Gemini ليُحلّل إجابات المستخدم.
 * يحتوي على بيانات الدورات + إجابات المستخدم بصيغة قابلة للقراءة.
 */
export function buildRecommendationPrompt(answers: QuizAnswers): string {
  const coursesBlock = COURSES.map(
    (c) => `
- ID: "${c.id}"
  العنوان: ${c.title}
  الفئة: ${c.category}
  عن الدورة: ${c.about}
  المحاور: ${c.topics.join('، ')}
  المدة: ${c.duration ?? 'غير محددة'}
  السعر: ${c.price ?? 'يرجى الاستفسار'}
  الجمهور المستهدف: ${c.targetAudience}`
  ).join('\n');

  const answersBlock = QUIZ_QUESTIONS.map((q) => {
    const answerId = answers[q.id];
    const option = q.options.find((o) => o.id === answerId);
    if (!option) return null;
    return `  • ${q.prompt}\n    الإجابة: "${option.label}" (${option.hint})`;
  })
    .filter(Boolean)
    .join('\n\n');

  return `
أنت مستشار تعليمي خبير في أكاديمية "${ACADEMY.name}". مهمتك توصية الطالب بالدورة الأنسب له بناءً على إجاباته.

ملاحظة عن المدرب: جميع دورات الأكاديمية يقدّمها الأستاذ "${INSTRUCTOR.name}" (${INSTRUCTOR.title}). يمكنك ذكر اسمه في \`reasoning\` عند الحاجة لإضفاء طابع شخصي.

📚 قائمة الدورات المتاحة:${coursesBlock}

📝 إجابات الطالب:
${answersBlock}

🎯 المطلوب:
١. حلّل الإجابات بدقة (مستوى، هدف، مجال، تخصص، وقت، ميزانية).
٢. اختر **دورة واحدة** من القائمة أعلاه (لا تخترع دورة غير موجودة).
٣. اكتب \`reasoning\` تحفيزياً ودوداً بالعربية (٢-٤ أسطر) يشرح:
   - لماذا هذه الدورة مناسبة لإجاباته تحديداً.
   - ما الذي سيحصل عليه ويغيّر مساره.
   - استخدم لغة استثمار وقيمة (الدورة استثمار في المستقبل).
٤. اقترح بديلاً واحداً أو اثنين فقط إن كان ذلك منطقياً (مع سبب موجز لكل بديل).
٥. حدّد \`confidence\`:
   - "high" إذا كانت الإجابات واضحة جداً ومتوافقة.
   - "medium" إذا كانت بعض الإجابات متناقضة.
   - "low" إذا كانت الإجابات مبهمة جداً.

⚠️ **مهم:** \`recommendedCourseId\` و \`alternatives[].courseId\` يجب أن تكون **بالضبط** أحد الـ IDs الموجودة في القائمة أعلاه.
`.trim();
}

/**
 * Schema لـ Structured Output. تضمن أن Gemini يرجع JSON بالشكل المتوقع
 * وأن `recommendedCourseId` يكون من قائمة الـ IDs المسموح بها فقط.
 */
export function buildResponseSchema() {
  const courseIds = COURSES.map((c) => c.id);
  return {
    type: 'object',
    properties: {
      recommendedCourseId: {
        type: 'string',
        enum: courseIds,
        description: 'معرّف الدورة الأنسب من القائمة المعطاة',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
      },
      reasoning: {
        type: 'string',
        description: 'شرح عربي تحفيزي ٢-٤ أسطر',
      },
      alternatives: {
        type: 'array',
        maxItems: 2,
        items: {
          type: 'object',
          properties: {
            courseId: { type: 'string', enum: courseIds },
            reason: { type: 'string' },
          },
          required: ['courseId', 'reason'],
          propertyOrdering: ['courseId', 'reason'],
        },
      },
    },
    required: ['recommendedCourseId', 'confidence', 'reasoning', 'alternatives'],
    propertyOrdering: ['recommendedCourseId', 'confidence', 'reasoning', 'alternatives'],
  };
}

// ─────────────────────────────────────────────────────────────────────────
//  Validation للنتيجة (إضافة طبقة أمان فوق Gemini)
// ─────────────────────────────────────────────────────────────────────────

/**
 * يتحقّق أن النتيجة من Gemini سليمة فعلاً قبل عرضها للمستخدم.
 * حماية من ردود فاسدة أو IDs غير موجودة (نظرياً enum يمنع هذا، لكن نتأكد).
 */
export function validateRecommendation(raw: unknown): Recommendation | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.recommendedCourseId !== 'string') return null;
  if (!COURSES.some((c) => c.id === r.recommendedCourseId)) return null;

  if (r.confidence !== 'high' && r.confidence !== 'medium' && r.confidence !== 'low') {
    return null;
  }

  if (typeof r.reasoning !== 'string' || r.reasoning.length === 0) return null;

  const alternatives: Recommendation['alternatives'] = [];
  if (Array.isArray(r.alternatives)) {
    for (const a of r.alternatives) {
      if (!a || typeof a !== 'object') continue;
      const alt = a as Record<string, unknown>;
      if (typeof alt.courseId !== 'string' || typeof alt.reason !== 'string') continue;
      if (!COURSES.some((c) => c.id === alt.courseId)) continue;
      if (alternatives.length >= 2) break;
      alternatives.push({ courseId: alt.courseId, reason: alt.reason });
    }
  }

  return {
    recommendedCourseId: r.recommendedCourseId,
    confidence: r.confidence,
    reasoning: r.reasoning,
    alternatives,
  };
}

/** يستخرج كائن دورة كامل من ID بشكل آمن. */
export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
