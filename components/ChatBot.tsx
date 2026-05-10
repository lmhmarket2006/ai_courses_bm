'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Send, Loader2, X, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useChat, type ChatStatus } from '@/hooks/use-chat';
import { CHAT_ASSISTANT } from '@/lib/config';
import { ChatCtaCard } from '@/components/chat/cta-card';

interface ChatBotProps {
  onMobileClose?: () => void;
}

interface AskExternalPayload {
  courseTitle: string;
  question: string;
}

/**
 * مكوّن واجهة الدردشة. مسؤوليته الوحيدة: العرض.
 * كل المنطق (تخزين، استدعاء API، streaming, rate limits) موجود في `useChat`.
 */
export default function ChatBot({ onMobileClose }: ChatBotProps) {
  const { messages, isLoading, sendMessage, reset, status } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 120;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AskExternalPayload>).detail;
      if (!detail?.question) return;
      const combined = `بخصوص دورة "${detail.courseTitle}": ${detail.question}`;
      void sendMessage(combined);
    };
    window.addEventListener('ask-chatbot', handler);
    return () => window.removeEventListener('ask-chatbot', handler);
  }, [sendMessage]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    if (status.kind === 'rate-limited') return;
    void sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const inputDisabled = isLoading || status.kind === 'rate-limited';

  const quickChips: { label: string; text: string }[] = [
    { label: '🎁 خصم 10%', text: 'ما الخصم المتاح؟' },
    { label: '💰 الأسعار', text: 'عاوز أشوف كل الأسعار' },
    { label: '📲 احجز الآن', text: 'احجز' },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-white/5 bg-brand-dark-surface shadow-2xl md:border-l">
      <ChatHeader onReset={reset} onMobileClose={onMobileClose} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/5"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl border-b-2 p-4 text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'border-black/10 bg-linear-to-r from-secondary via-accent to-primary font-medium text-white'
                    : m.error
                      ? 'border border-red-500/20 bg-red-950/40 text-red-100'
                      : 'border-b-2 border-white/5 bg-[#12182f] text-[#f1f5f9]'
                }`}
              >
                {m.error && (
                  <div className="flex items-center gap-2 mb-2 text-red-300 text-[11px] font-bold">
                    <AlertCircle size={12} />
                    خطأ
                  </div>
                )}
                {m.text}
                {m.streaming && (
                  <span className="inline-block w-1.5 h-4 bg-current align-middle ml-1 animate-pulse" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#12182f] p-3">
              <Loader2 size={16} className="animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      <StatusBanner status={status} />

      <div className="space-y-3 border-t border-white/5 bg-brand-dark-surface p-4 md:p-5">
        <ChatCtaCard />

        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="اختصارات سريعة">
          {quickChips.map((chip) => (
            <button
              key={chip.text}
              type="button"
              disabled={inputDisabled}
              onClick={() => void sendMessage(chip.text)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white/90 transition-all hover:border-primary/40 hover:bg-primary/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">اكتب رسالتك</label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              status.kind === 'rate-limited'
                ? 'الإرسال مؤقتاً متوقف...'
                : status.kind === 'expired'
                  ? 'أرسل رسالة لبدء محادثة جديدة...'
                  : 'اكتب استفسارك هنا...'
            }
            disabled={inputDisabled}
            className="w-full rounded-2xl border border-white/10 bg-brand-dark py-4 ps-4 pe-14 text-[13px] text-white transition-all focus:border-accent/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={inputDisabled || !input.trim()}
            aria-label="إرسال الرسالة"
            className="absolute end-2 rounded-xl bg-primary p-2.5 text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-hover disabled:scale-100 disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  مكوّنات داخلية
// ─────────────────────────────────────────────────────────────────────────

function ChatHeader({
  onReset, onMobileClose,
}: { onReset: () => void; onMobileClose?: () => void }) {
  return (
    <div className="border-b border-white/5 bg-brand-dark/60 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-accent to-secondary text-white shadow-lg ring-1 ring-white/20 md:h-11 md:w-11">
              <Image
                src="/assistant-icon.png"
                alt="أيقونة المساعد الذكي"
                width={44}
                height={44}
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-brand-dark-surface bg-green-500" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-extrabold leading-tight text-[#f8fafc] md:text-sm">
              {CHAT_ASSISTANT.nameAr} — مساعدك الذكي
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="flex w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                متصل الآن (Online)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            aria-label="بدء محادثة جديدة"
            title="بدء محادثة جديدة"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="إغلاق الشات"
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * شريط حالة يظهر فوق صندوق الإدخال لشرح حالات: rate-limited / expired.
 */
function StatusBanner({ status }: { status: ChatStatus }) {
  if (status.kind === 'active') return null;

  if (status.kind === 'rate-limited') {
    return (
      <div className="px-5 py-4 bg-red-500/10 border-t border-red-500/20 flex items-start gap-3">
        <Clock size={18} className="text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-red-100 leading-relaxed font-medium">
            {status.message}
          </p>
          <CountdownLabel until={status.until} />
        </div>
      </div>
    );
  }

  if (status.kind === 'expired') {
    return (
      <div className="px-5 py-3 bg-slate-500/10 border-t border-slate-500/20 flex items-center gap-2">
        <Clock size={14} className="text-slate-400 shrink-0" />
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
          {status.message}
        </p>
      </div>
    );
  }

  return null;
}

/** يعرض عداداً تنازلياً بالثواني حتى ينتهي الوقت `until`. */
function CountdownLabel({ until }: { until: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = Math.max(0, until - now);
  const seconds = Math.ceil(remainingMs / 1000);
  if (seconds <= 0) return null;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = minutes > 0 ? `${minutes} دقيقة و ${secs} ثانية` : `${secs} ثانية`;

  return (
    <p className="text-[10px] text-red-200/70 mt-1 font-mono">
      المتاح خلال: {label}
    </p>
  );
}
