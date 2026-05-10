'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CourseTopicsNarrativeProps {
  text: string;
  className?: string;
}

/**
 * نص برنامج الدورة كما يكتبه التسويق (فقرات، رموز تعبيرية، لهجة).
 * يُعرض بدل قائمة «محاور البرنامج» ذات التصنيفات عندما يُعرّف `topicsNarrative` في الدورة.
 */
export default function CourseTopicsNarrative({ text, className }: CourseTopicsNarrativeProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        'min-w-0 whitespace-pre-wrap break-words text-right text-[12px] font-medium leading-[1.85] text-foreground md:text-[13px]',
        'rounded-2xl border border-brand-subtle bg-page/80 p-5 shadow-inner dark:bg-page/40 md:p-7',
        className
      )}
    >
      {text}
    </div>
  );
}
