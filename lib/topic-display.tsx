import React from 'react';
import {
  Target, Users, Heart, Shirt, Utensils, Zap, Brain, Palette,
  Timer, Aperture, Layers, Smartphone, Volume2, Megaphone, Award,
} from 'lucide-react';

/**
 * تصنيف بصري لمحاور الدورات.
 * يُستخدم في `CourseList` و`CourseDetailsSection` لإظهار أيقونة وفئة لكل محور.
 */
export interface TopicDisplay {
  icon: React.ReactNode;
  /** Tailwind classes للون النص + الخلفية + الإطار */
  colorClass: string;
  /** اسم الفئة المعروضة فوق المحور */
  categoryName: string;
}

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface Rule {
  keywords: string[];
  Icon: IconComponent;
  colorClass: string;
  categoryName: string;
}

/**
 * قائمة قواعد التصنيف، مرتّبة من الأكثر تخصصاً إلى الأعم.
 * هيكل البيانات هذا أنظف بكثير من سلسلة `if/else` الأصلية ويسهل تعديله.
 */
const RULES: Rule[] = [
  // 1. مهارات تطبيقية وفنية (أحمر)
  {
    keywords: ['تكوين', 'زوايا', 'قواعد', 'تطبيق', 'سرد', 'عملي', 'بورتريه', 'توزيع'],
    Icon: Target,
    colorClass: 'text-primary bg-primary/5 border-primary/10',
    categoryName: 'مهارة تطبيقية',
  },
  {
    keywords: ['مودلز', 'عارضين', 'التعامل', 'توجيه', 'إدارة', 'تواصل'],
    Icon: Users,
    colorClass: 'text-primary bg-primary/5 border-primary/10',
    categoryName: 'تواصل وقيادة',
  },
  {
    keywords: ['أعراس', 'أفراح', 'زفاف', 'مناسبات'],
    Icon: Heart,
    colorClass: 'text-primary bg-primary/5 border-primary/10',
    categoryName: 'تصوير مناسبات',
  },
  {
    keywords: ['ملابس', 'أزياء', 'فاشن', 'تنسيق'],
    Icon: Shirt,
    colorClass: 'text-primary bg-primary/5 border-primary/10',
    categoryName: 'أزياء وتنسيق',
  },
  {
    keywords: ['طعام', 'أطعمة', 'مطاعم'],
    Icon: Utensils,
    colorClass: 'text-primary bg-primary/5 border-primary/10',
    categoryName: 'تصوير أطعمة',
  },

  // 2. مفاهيم نظرية وإضاءة (بنفسجي/برتقالي)
  {
    keywords: ['ضوء', 'إضاءة', 'تعديل الإضاءة', 'استوديو'],
    Icon: Zap,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'هندسة الضوء',
  },
  {
    keywords: ['أساسيات', 'آلية', 'مفاهيم', 'فهم', 'أسس', 'سيناريو'],
    Icon: Brain,
    colorClass: 'text-accent bg-accent/5 border-accent/10',
    categoryName: 'مفهوم نظري',
  },
  {
    keywords: ['ألوان', 'جمال', 'تأثير', 'فلسفة'],
    Icon: Palette,
    colorClass: 'text-accent bg-accent/5 border-accent/10',
    categoryName: 'جماليات فنية',
  },
  {
    keywords: ['وقت', 'تنظيم', 'سير العمل', 'جدولة'],
    Icon: Timer,
    colorClass: 'text-accent bg-accent/5 border-accent/10',
    categoryName: 'إدارة الإنتاج',
  },

  // 3. أدوات وإعدادات تقنية (أزرق)
  {
    keywords: ['إعدادات', 'فتحة', 'غالق', 'كاميرا', 'مثلث', 'عدسات', 'آيزو', 'حساس'],
    Icon: Aperture,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'ضبط الكاميرا',
  },
  {
    keywords: ['فيديو', 'مونتاج', 'تعديل', 'ريتاتش', 'فوتوشوب', 'لايت روم'],
    Icon: Layers,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'معالجة رقمية',
  },
  {
    keywords: ['جوال', 'هاتف', 'سناب', 'تيك توك', 'تطبيقات', 'تثبيت'],
    Icon: Smartphone,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'تصوير ذكي',
  },
  {
    keywords: ['صوت', 'موسيقى', 'مايك', 'تسجيل'],
    Icon: Volume2,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'هندسة صوت',
  },
  {
    keywords: ['تجاري', 'تسويق', 'إعلان', 'براند'],
    Icon: Megaphone,
    colorClass: 'text-secondary bg-secondary/5 border-secondary/10',
    categoryName: 'تسويق تجاري',
  },
];

const FALLBACK: Omit<Rule, 'keywords'> = {
  Icon: Award,
  colorClass: 'text-slate-500 bg-slate-50 border-slate-100',
  categoryName: 'محور تدريبي',
};

/**
 * يُرجع المعلومات البصرية المناسبة لمحور دورة معيّن.
 * @param topic نص المحور كما هو مكتوب في `lib/courses.ts`
 * @param iconSize حجم الأيقونة بالبكسل (افتراضي 14)
 */
export function getTopicDisplay(topic: string, iconSize: number = 14): TopicDisplay {
  const t = topic.toLowerCase();
  const match = RULES.find((r) => r.keywords.some((k) => t.includes(k)));
  const { Icon, colorClass, categoryName } = match ?? FALLBACK;
  return {
    icon: <Icon size={iconSize} />,
    colorClass,
    categoryName,
  };
}
