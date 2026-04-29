'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/motion-variants';

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** عند true يُفعّل stagger للأبناء المباشرين */
  stagger?: boolean;
};

export function SectionReveal({ children, className, stagger = false }: SectionRevealProps) {
  if (stagger) {
    return (
      <motion.div
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={staggerContainer}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.section
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={fadeInUp}
    >
      {children}
    </motion.section>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeInUp} className={cn(className)}>
      {children}
    </motion.div>
  );
}
