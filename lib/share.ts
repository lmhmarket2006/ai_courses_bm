/**
 * أدوات مشاركة الدورات على الشبكات الاجتماعية.
 * فُصلت عن مكوّنات الـ UI لتسهيل الاختبار وإعادة الاستخدام.
 */

import type { Course } from './courses';

export type SharePlatform = 'whatsapp' | 'x' | 'facebook' | 'email' | 'copy';

interface ShareTarget {
  url: string;
  title: string;
  description: string;
}

function buildShareTarget(course: Course, currentUrl: string): ShareTarget {
  return {
    url: currentUrl,
    title: course.title,
    description: `اكتشف دورة "${course.title}" في أكاديمية بيت المصور! ${course.about.substring(0, 80)}...`,
  };
}

/**
 * ينفّذ عملية مشاركة على المنصة المحدّدة.
 * @returns رسالة نجاح للعرض في Toast (إن وُجدت).
 */
export async function shareCourse(
  course: Course,
  platform: SharePlatform,
  currentUrl: string
): Promise<string | null> {
  const target = buildShareTarget(course, currentUrl);
  const enc = encodeURIComponent;

  switch (platform) {
    case 'x':
      window.open(
        `https://x.com/intent/tweet?text=${enc(target.description)}&url=${enc(target.url)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return null;

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${enc(target.url)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return null;

    case 'whatsapp':
      window.open(
        `https://wa.me/?text=${enc(`${target.description} ${target.url}`)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return null;

    case 'email':
      window.location.href = `mailto:?subject=${enc(target.title)}&body=${enc(`${target.description}\n\n${target.url}`)}`;
      return null;

    case 'copy':
      try {
        await navigator.clipboard.writeText(target.url);
        return 'تم نسخ الرابط بنجاح!';
      } catch {
        return 'تعذّر نسخ الرابط، يرجى المحاولة يدوياً.';
      }
  }
}
