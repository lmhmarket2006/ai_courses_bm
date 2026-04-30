'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import CourseList from '@/components/CourseList';
import RecommenderCTA from '@/components/RecommenderCTA';
import RecommenderModal from '@/components/recommender/RecommenderModal';
import InstructorBadge from '@/components/InstructorBadge';
import { Testimonials, FAQSection, StatsSection } from '@/components/TrustSections';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { ACADEMY } from '@/lib/config';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-page font-sans text-foreground">
      <AnimatedBackground />
      <Header />

      <div className="mt-[100px] grid flex-1 grid-cols-1 md:mt-[120px] lg:grid-cols-[340px_1fr]">
        <aside
          aria-label="مساعد ذكي"
          className="sticky top-[120px] hidden h-[calc(100vh-120px)] border-l border-brand-subtle bg-card lg:block"
        >
          <ChatBot />
        </aside>

        <section className="bg-page pb-32 dark:bg-transparent">
          <div className="mx-auto max-w-7xl px-6 py-12 md:px-16 md:py-24 lg:px-24">
            <div className="mb-20 lg:hidden" id="mobile-chatbot">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="group flex w-full items-center justify-between rounded-[2rem] border border-brand-subtle bg-card p-5 text-foreground transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-secondary via-accent to-primary text-white shadow-lg">
                    <Image
                      src="/assistant-mobile-icon.png"
                      alt="أيقونة المساعد الذكي"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <div className="text-right">
                    <h3 className="mb-0.5 text-sm font-black">مساعدك الذكي</h3>
                    <p className="text-[9px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                      تحدث معنا الآن
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-green-600">
                  Online
                </div>
              </button>
            </div>

            <SectionReveal className="mb-24 text-right md:mb-32">
              <div className="mb-8 flex items-center gap-4 md:gap-6">
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.4em] text-primary md:text-[11px] md:tracking-[0.6em]">
                  استثمر في رؤيتك... قبل عدستك.
                </span>
              </div>
              <h2 className="mb-8 text-4xl font-black leading-none tracking-tight text-foreground md:mb-10 md:text-6xl">
                مسارات تصنع <br className="hidden md:block" /> مستقبلك المهني
              </h2>
              <p className="mr-auto max-w-3xl text-xl font-medium leading-relaxed text-secondary/80 md:text-3xl md:leading-normal">
                في {ACADEMY.name}، نحن لا نعطي دورات، بل نفتح لك أبواباً لمهنة تدر عليك دخلاً وشغفاً. المهارة هي الاستثمار الوحيد الذي ينمو معك.
              </p>
            </SectionReveal>

            <SectionReveal className="mb-16 md:mb-24">
              <RecommenderCTA onClick={() => setIsRecommenderOpen(true)} />
            </SectionReveal>

            <SectionReveal className="mt-8">
              <CourseList />
            </SectionReveal>

            <div className="mt-24 space-y-24">
              <SectionReveal>
                <StatsSection />
              </SectionReveal>

              <SectionReveal>
                <section id="instructor" className="scroll-mt-32">
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
                      تعرّف على <span className="text-primary">المدرب</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
                      خبرة سنوات من العمل الميداني والاحترافي تنتقل إليك مباشرةً.
                    </p>
                  </div>
                  <div className="mx-auto max-w-3xl">
                    <InstructorBadge variant="full" />
                  </div>
                </section>
              </SectionReveal>

              <SectionReveal>
                <Testimonials />
              </SectionReveal>
              <SectionReveal>
                <FAQSection />
              </SectionReveal>
            </div>

          </div>

          <footer className="flex flex-col gap-10 border-t border-white/10 bg-brand-dark px-8 py-16 text-[#fff9f0] md:px-12">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 shrink-0 rounded-lg logo-gradient" />
                <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/55">
                  © {new Date().getFullYear()} {ACADEMY.nameEn}
                </div>
              </div>
              <InstructorBadge variant="compact" theme="dark" />
              <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-extrabold uppercase tracking-widest text-white/60 md:gap-12">
                <a href="#terms" className="transition-colors duration-300 hover:text-primary">
                  الأحكام
                </a>
                <a href="#privacy" className="transition-colors duration-300 hover:text-primary">
                  الخصوصية
                </a>
                <a href="#support" className="transition-colors duration-300 hover:text-primary">
                  الدعم
                </a>
              </div>
            </div>
            <div className="mx-auto max-w-7xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">أكاديمية بيت المصور</p>
            </div>
          </footer>

          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="العودة للأعلى"
            className="group fixed bottom-8 left-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-subtle bg-card text-primary shadow-xl transition-all duration-300 hover:border-primary/30 hover:bg-primary hover:text-white"
          >
            <ArrowUp size={24} className="transition-transform group-hover:-translate-y-1" />
          </motion.button>

          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsChatOpen(true)}
            aria-label="فتح المساعد الذكي"
            className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-accent to-secondary text-white shadow-2xl ring-1 ring-white/20 transition-all hover:scale-105 active:scale-95 lg:hidden"
          >
            <div className="relative">
              <Image
                src="/assistant-mobile-icon.png"
                alt="أيقونة المساعد الذكي"
                width={44}
                height={44}
                className="rounded-xl object-cover"
                priority
              />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-accent bg-green-500" />
            </div>
          </motion.button>

          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="fixed inset-0 z-[100] bg-page lg:hidden"
              >
                <ChatBot onMobileClose={() => setIsChatOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <RecommenderModal isOpen={isRecommenderOpen} onClose={() => setIsRecommenderOpen(false)} />
    </main>
  );
}
