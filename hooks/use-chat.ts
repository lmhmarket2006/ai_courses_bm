'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_ASSISTANT, CHAT_CONFIG, DISCOUNT, RATE_LIMITS } from '@/lib/config';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  /** معرّف فريد لكل رسالة (يستخدم في React keys بدلاً من index غير المستقر) */
  id: string;
  role: ChatRole;
  text: string;
  /** هل هذه الرسالة قيد البث حالياً (لإظهار مؤشر الكتابة) */
  streaming?: boolean;
  /** رسائل الخطأ تحمل هذه العلامة لتمييزها بصرياً */
  error?: boolean;
}

/**
 * حالة المحادثة:
 *  - active: مفتوحة وقابلة للإرسال
 *  - rate-limited: ضرب الحد على مستوى IP، مؤقت قابل للاستئناف بعد retryAfter
 *  - expired: انتهت محلياً بسبب الخمول (٥ دقائق)، ستُنشأ محادثة جديدة عند أول رسالة
 */
export type ChatStatus =
  | { kind: 'active' }
  | { kind: 'rate-limited'; until: number; message: string }
  | { kind: 'expired'; message: string };

interface StoredState {
  conversationId: string;
  lastActivity: number;
  messages: ChatMessage[];
  /** نسخة هيكل البيانات لتسهيل الترقية المستقبلية */
  v: 4;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: `أهلاً! أنا ${CHAT_ASSISTANT.nameAr} 🤖 مساعدك الذكي في بيت المصور. أساعدك تختار الدورة وتعرف الأسعار التقريبية؛ وللحجز والخصم الحصري ${DISCOUNT.percent}% (كود ${DISCOUNT.code}) مع علياء — اكتب «احجز» أو استخدم الأزرار السريعة فوق صندوق الكتابة.\n\nما اسمك الكريم؟`,
};

// ─────────────────────────────────────────────────────────────────────────
//  دوال مساعدة
// ─────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // fallback — يولّد سلسلة بصيغة UUID v4 للمتصفحات القديمة
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += hex[(Math.random() * 4) | (0 + 8)];
    else out += hex[(Math.random() * 16) | 0];
  }
  return out;
}

function freshState(): StoredState {
  return {
    conversationId: generateId(),
    lastActivity: Date.now(),
    messages: [WELCOME_MESSAGE],
    v: 4,
  };
}

function loadState(): StoredState {
  if (typeof window === 'undefined') return freshState();
  try {
    const raw = window.localStorage.getItem(CHAT_CONFIG.storageKey);
    if (!raw) return freshState();

    const parsed = JSON.parse(raw) as Partial<StoredState>;

    if (parsed.v !== 4 || !parsed.conversationId || !parsed.messages) {
      return freshState();
    }

    if (Date.now() - (parsed.lastActivity ?? 0) > RATE_LIMITS.conversation.idleMs) {
      return freshState();
    }

    return {
      conversationId: parsed.conversationId,
      lastActivity: parsed.lastActivity ?? Date.now(),
      messages: parsed.messages,
      v: 4,
    };
  } catch {
    return freshState();
  }
}

function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed: StoredState = {
      ...state,
      messages: state.messages.slice(-CHAT_CONFIG.historyLimit),
    };
    window.localStorage.setItem(CHAT_CONFIG.storageKey, JSON.stringify(trimmed));
  } catch {
    /* تجاهل أخطاء التخزين (وضع التصفح الخاص الممتلئ) */
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Hook الرئيسي
// ─────────────────────────────────────────────────────────────────────────

/**
 * Hook موحّد لإدارة المحادثة.
 *
 * يفصل المنطق عن العرض، ويُسهّل اختبار:
 *  - حفظ/استعادة الحالة في localStorage.
 *  - استدعاء `/api/chat` بـ streaming.
 *  - معالجة 429 (Rate Limit من الخادم) مع عداد تنازلي تلقائي.
 *  - إنهاء المحادثة محلياً بعد ٥ دقائق خمول (UX فقط، الخادم بلا حالة محادثة).
 */
export function useChat() {
  const [state, setState] = useState<StoredState>(() => freshState());
  const [status, setStatus] = useState<ChatStatus>({ kind: 'active' });
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hydration من localStorage عند الـ mount.
    // هذا استخدام مشروع لـ setState في effect (sync مع external store)،
    // لكن قاعدة react-hooks/set-state-in-effect متحفّظة فتُنبّه.
    // البديل الكامل سيكون useSyncExternalStore، لكنه مبالغة لهذه الحالة.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // مؤقت الخمول المحلي: عند انتهاء ٥ دقائق بدون نشاط → expired.
  // نستخدم setTimeout بـ delay 0 إن كان الوقت قد فات، حتى يحدث setState داخل
  // callback (وليس body of effect) ونتفادى تحذير react-hooks/set-state-in-effect.
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (status.kind !== 'active') return;

    const timeUntilExpiry = RATE_LIMITS.conversation.idleMs - (Date.now() - state.lastActivity);

    idleTimerRef.current = setTimeout(() => {
      setStatus({
        kind: 'expired',
        message: 'انتهت المحادثة بسبب عدم النشاط. أرسل أي رسالة لبدء محادثة جديدة.',
      });
    }, Math.max(0, timeUntilExpiry));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [state.lastActivity, status.kind]);

  // مؤقت rate-limited: عند انتهاء فترة الانتظار، عُد إلى active.
  useEffect(() => {
    if (status.kind !== 'rate-limited') return;
    const remaining = Math.max(0, status.until - Date.now());
    const t = setTimeout(() => setStatus({ kind: 'active' }), remaining);
    return () => clearTimeout(t);
  }, [status]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(freshState());
    setStatus({ kind: 'active' });
    setIsLoading(false);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  /**
   * إرسال رسالة جديدة. يتعامل مع كل حالات الفشل:
   *  - 429 rate_limited → ينتقل لـ rate-limited مع مؤقت تلقائي بحسب retryAfter.
   *  - أخطاء أخرى → يضع علامة error على الرسالة.
   *  - expired (محلي) → يُعيد التهيئة فوراً ويرسل في محادثة جديدة.
   */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // امنع الإرسال إذا الحالة rate-limited.
      if (status.kind === 'rate-limited') return;

      // إذا انتهت المحادثة بالخمول، أعد التهيئة قبل الإرسال.
      let workingState = state;
      const idleExceeded = Date.now() - state.lastActivity > RATE_LIMITS.conversation.idleMs;
      if (status.kind === 'expired' || idleExceeded) {
        workingState = freshState();
        setState(workingState);
        setStatus({ kind: 'active' });
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmed };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: '',
        streaming: true,
      };

      const baseMessages = workingState.messages.filter((m) => !m.error);
      const userTurnNumber = baseMessages.filter((m) => m.role === 'user').length + 1;

      const newState: StoredState = {
        ...workingState,
        lastActivity: Date.now(),
        messages: [...workingState.messages, userMsg, assistantMsg],
      };
      setState(newState);
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: workingState.conversationId,
            messages: baseMessages.map((m) => ({ role: m.role, text: m.text })),
            message: trimmed,
            userTurnNumber,
          }),
          signal: controller.signal,
        });

        // معالجة Rate Limit
        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          const message: string = data.message ?? 'تم تجاوز الحد المسموح.';
          const retryAfterSec: number =
            typeof data.retryAfter === 'number'
              ? data.retryAfter
              : Number(res.headers.get('Retry-After') ?? '60');

          // أزل الرسالتين الأخيرتين (المستخدم + الـ placeholder الفارغ).
          setState((s) => ({
            ...s,
            messages: s.messages.slice(0, -2),
          }));

          setStatus({
            kind: 'rate-limited',
            until: Date.now() + Math.max(retryAfterSec, 1) * 1000,
            message,
          });
          return;
        }

        if (!res.ok || !res.body) {
          const errBody = await res.json().catch(() => ({ error: 'فشل غير معروف' }));
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) => (m.id === assistantMsg.id ? { ...m, text: acc } : m)),
          }));
        }

        setState((s) => ({
          ...s,
          lastActivity: Date.now(),
          messages: s.messages.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, streaming: false, text: acc || 'عذراً، لم أستطع توليد رد.' }
              : m
          ),
        }));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[useChat]', err);
        setState((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  streaming: false,
                  error: true,
                  text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
                }
              : m
          ),
        }));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [state, status, isLoading]
  );

  return {
    messages: state.messages,
    conversationId: state.conversationId,
    isLoading,
    status,
    sendMessage,
    reset,
    stop,
  };
}
