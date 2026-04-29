'use client';

import { Instagram, MessageCircle, Sparkles } from 'lucide-react';
import { BOOKINGS, CONTACT, DISCOUNT } from '@/lib/config';
import { buildAliaaHandoffUrl } from '@/lib/whatsapp';

/**
 * بطاقة تحويل فاخرة تحت الشات — علياء + خصم + روابط مباشرة.
 */
export function ChatCtaCard() {
  const waHref = buildAliaaHandoffUrl();

  return (
    <div className="rounded-2xl border border-white/10 bg-[#12182f]/95 shadow-xl backdrop-blur-md">
      <div className="relative overflow-hidden rounded-t-2xl px-4 py-2.5">
        <div
          className="absolute inset-0 bg-linear-to-r from-amber-600/90 via-yellow-400/85 to-amber-500/90"
          aria-hidden
        />
        <div className="relative flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#1a0a02]">
          <Sparkles size={14} className="shrink-0" aria-hidden />
          خصم {DISCOUNT.percent}% حصري — كود {DISCOUNT.code}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">👩‍💼 {BOOKINGS.contactName}</p>
          <p className="text-[9px] text-white/55">{BOOKINGS.role}</p>
        </div>

        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[9px] leading-relaxed text-white/75">
          ابدأ رسالتك:{' '}
          <span className="font-bold text-amber-200/95">&quot;{BOOKINGS.messagePrefix}&quot;</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md transition-all hover:bg-primary-hover"
          >
            <MessageCircle size={14} aria-hidden />
            واتساب
          </a>
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-white transition-all hover:border-primary/40 hover:bg-primary/10"
          >
            <Instagram size={14} aria-hidden />
            @{BOOKINGS.instagramHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
