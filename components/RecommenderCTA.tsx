'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, Clock } from 'lucide-react';

interface RecommenderCTAProps {
  onClick: () => void;
}

/**
 * زر CTA بارز يدعو الزائر لخوض اختبار التوصية الذكية.
 *
 * مُصمَّم ليكون عنصراً بصرياً قوياً يلفت الانتباه فور دخول الصفحة.
 * يستخدم gradient متحرّك وأيقونة المساعد لتوحيد الهوية البصرية.
 */
export default function RecommenderCTA({ onClick }: RecommenderCTAProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-[2rem] border border-transparent p-1 logo-gradient shadow-2xl shadow-primary/15 transition-all hover:shadow-primary/25 md:rounded-[2.5rem]"
      aria-label="افتح استبيان التوصية الذكية"
    >
      {/* تأثير لمعان متحرّك */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
      />

      <div className="relative flex flex-col items-center gap-5 rounded-[1.8rem] bg-card p-6 text-right md:flex-row md:gap-8 md:rounded-[2.3rem] md:p-8">
        {/* أيقونة كبيرة */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl logo-gradient text-white shadow-xl shadow-primary/20 md:h-20 md:w-20 md:rounded-3xl"
        >
          <Image
            src="/assistant-icon.png"
            alt="أيقونة المساعد الذكي"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* نص الترويج */}
        <div className="flex-1 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.3em] text-primary md:text-[9px]">
              ميزة جديدة
            </span>
            <span className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground md:text-[9px]">
              <Clock size={10} />
              ٣٠ ثانية
            </span>
          </div>

          <h3 className="mb-1.5 text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl lg:text-3xl">
            لا تعرف أي دورة تناسبك؟
          </h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground md:text-[15px]">
            جاوب على ٦ أسئلة سريعة، ومساعدنا الذكي يقترح لك الدورة المثالية فوراً.
          </p>
        </div>

        {/* سهم الإجراء */}
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-dark text-white transition-colors group-hover:bg-primary md:flex">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}
