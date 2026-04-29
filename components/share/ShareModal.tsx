'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Twitter, Facebook, Mail, Link2, MessageCircle } from 'lucide-react';
import type { Course } from '@/lib/courses';
import { shareCourse, type SharePlatform } from '@/lib/share';
import { useToast } from '@/components/ui/Toast';

interface ShareModalProps {
  /** الدورة المُراد مشاركتها. تمرير `null` يخفي النافذة. */
  course: Course | null;
  onClose: () => void;
}

interface PlatformConfig {
  id: SharePlatform;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
  hoverBorder: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'whatsapp',
    label: 'واتساب',
    icon: <MessageCircle size={24} />,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    hoverBg: 'hover:bg-green-50',
    hoverBorder: 'hover:border-green-100',
  },
  {
    id: 'x',
    label: 'تويتر (X)',
    icon: <Twitter size={24} />,
    iconBg: 'bg-slate-900/10',
    iconColor: 'text-slate-900',
    hoverBg: 'hover:bg-slate-50',
    hoverBorder: 'hover:border-slate-200',
  },
  {
    id: 'facebook',
    label: 'فيسبوك',
    icon: <Facebook size={24} />,
    iconBg: 'bg-blue-600/10',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    hoverBorder: 'hover:border-blue-100',
  },
  {
    id: 'email',
    label: 'إيميل',
    icon: <Mail size={24} />,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    hoverBg: 'hover:bg-orange-50',
    hoverBorder: 'hover:border-orange-100',
  },
];

/**
 * نافذة مشاركة دورة على الشبكات الاجتماعية.
 * مكوّن مشترك يُستخدم في `CourseList` و`FeaturedCourses`.
 */
export default function ShareModal({ course, onClose }: ShareModalProps) {
  const { show } = useToast();

  const handleShare = async (platform: SharePlatform) => {
    if (!course) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = await shareCourse(course, platform, currentUrl);
    if (message) show(message, platform === 'copy' ? 'success' : 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      {course && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5"
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h3
                  id="share-title"
                  className="font-extrabold text-xl text-slate-900 uppercase tracking-tight"
                >
                  مشاركة الدورة
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق نافذة المشاركة"
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-8 text-center bg-slate-50 py-3 rounded-xl border border-black/5">
                انشر المعرفة.. شارك دورة {course.title}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleShare(p.id)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-3xl border border-black/5 transition-all group ${p.hoverBg} ${p.hoverBorder}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${p.iconBg} ${p.iconColor}`}
                    >
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleShare('copy')}
                className="w-full py-4 bg-slate-50 border border-black/5 rounded-2xl text-slate-700 font-extrabold uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
              >
                <Link2 size={16} />
                نسخ رابط الدورة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
