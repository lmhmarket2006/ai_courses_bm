'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronDown, MessageCircle, Users, Award, Target, Star } from 'lucide-react';
import { TESTIMONIALS, FAQS } from '@/lib/courses';
import { ACADEMY_STATS } from '@/lib/config';

/**
 * تنسيق الأرقام بالأرقام العربية الهندية (٠١٢٣...) لتتناسب مع التصميم العربي.
 * يضاف "+" للقيم الكبيرة و"٪" للنسب.
 */
function formatStat(value: number, suffix?: '+' | '%'): string {
  const arabic = value.toLocaleString('ar-EG');
  if (suffix === '%') return `٪${arabic}`;
  if (suffix === '+') return `+${arabic}`;
  return arabic;
}

export function StatsSection() {
  const stats = [
    { label: 'متدرب ومتدربة', value: formatStat(ACADEMY_STATS.trainees, '+'), icon: <Users size={24} /> },
    { label: 'عام من الخبرة', value: formatStat(ACADEMY_STATS.yearsOfExperience, '+'), icon: <Award size={24} /> },
    { label: 'ورشة عمل مكثفة', value: formatStat(ACADEMY_STATS.workshops, '+'), icon: <Target size={24} /> },
    { label: 'تقييم إيجابي', value: formatStat(ACADEMY_STATS.positiveRating, '%'), icon: <Star size={24} /> },
  ];

  return (
    <section className="py-24 relative overflow-hidden" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">إحصائيات الأكاديمية</h2>
      <div className="max-w-7xl mx-auto px-5 md:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-subtle bg-card text-primary shadow-xl shadow-primary/10">
                {stat.icon}
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden" aria-labelledby="testimonials-heading">
      <motion.div
        animate={{ x: [0, 50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/2 left-0 -z-10 h-64 w-64 -translate-y-1/2 bg-primary/5 blur-[100px]"
      />

      <div className="max-w-7xl mx-auto px-5 md:px-20">
        <div className="text-center mb-16">
          <h2 id="testimonials-heading" className="mb-6 text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            قصص <span className="text-primary">النجاح</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
            انضم إلى أكثر من ٥٠,٠٠٠ مصور ومصورة بدأوا رحلة احترافهم معنا. هذه بعض تجاربهم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-[2.5rem] border border-brand-subtle bg-card p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-lg"
            >
              <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl logo-gradient text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                <Quote size={20} aria-hidden="true" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={t.avatar}
                    alt={`صورة ${t.name}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold leading-tight text-foreground">{t.name}</h4>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-accent">{t.role}</p>
                </div>
              </div>

              <blockquote className="text-xs italic leading-relaxed text-muted-foreground" dir="rtl">
                &quot;{t.text}&quot;
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 relative overflow-hidden" aria-labelledby="faq-heading">
      <motion.div
        animate={{ x: [0, -50, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-0 right-0 -z-10 h-80 w-80 bg-secondary/5 blur-[120px]"
      />
      <div className="max-w-4xl mx-auto px-5 md:px-20 text-right">
        <div className="mb-16 text-center">
          <h2 id="faq-heading" className="mb-6 text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            الأسئلة <span className="text-secondary">الشائعة</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
            ربما يدور في ذهنك بعض التساؤلات، إليك الإجابات الأكثر شيوعاً.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;
            return (
              <div key={idx} className="overflow-hidden rounded-3xl border border-brand-subtle bg-card shadow-sm transition-shadow hover:shadow-md">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between gap-4 text-right group"
                >
                  <div className={`rounded-lg p-2 transition-transform ${isOpen ? 'rotate-180 bg-secondary text-white' : 'bg-page text-muted-foreground group-hover:bg-primary/5'}`}>
                    <ChevronDown size={20} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-extrabold uppercase tracking-tight text-foreground">
                    {faq.question}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="ml-auto max-w-2xl px-8 pb-8 text-xs leading-relaxed text-muted-foreground">
                        <div className="mb-6 h-px w-full bg-[var(--border-subtle)]" />
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-subtle bg-card p-4 px-8 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">هل لديك سؤال آخر؟</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary transition-colors hover:text-primary"
            >
              <MessageCircle size={14} />
              اسأل المدرب الذكي
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
