import { BOOKINGS, CONTACT } from './config';

/**
 * يُولّد رابط واتساب لطلب حجز دورة. يستخدم `CONTACT.whatsapp` المركزي.
 *
 * @param courseTitle اسم الدورة المُراد حجزها.
 * @param source     مصدر الضغطة (يُذكر في الرسالة لمساعدة فريق المبيعات في التتبع).
 */
export function buildBookingUrl(courseTitle: string, source: string = 'الموقع'): string {
  const phone = CONTACT.whatsapp.replace(/[^\d]/g, '');
  const text = `السلام عليكم، أرغب في الاستفسار وحجز مقعد في دورة "${courseTitle}". (تم الإرسال عبر ${source})`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** يفتح رابط حجز دورة في تبويب جديد. */
export function openBooking(courseTitle: string, source: string = 'الموقع'): void {
  if (typeof window === 'undefined') return;
  window.open(buildBookingUrl(courseTitle, source), '_blank', 'noopener,noreferrer');
}

/** رابط واتساب لعلياء مع بادئة كود المساعد الذكي (للتحويل من الشات). */
export function buildAliaaHandoffUrl(note?: string): string {
  const phone = CONTACT.whatsapp.replace(/[^\d]/g, '');
  const text =
    note ??
    `${BOOKINGS.messagePrefix}\n\nالسلام عليكم، أود التواصل مع ${BOOKINGS.contactName} للحجز والاستفادة من الخصم.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function openAliaaHandoff(note?: string): void {
  if (typeof window === 'undefined') return;
  window.open(buildAliaaHandoffUrl(note), '_blank', 'noopener,noreferrer');
}
