'use client';

import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-cream to-white dark:from-brand-dark dark:to-brand-dark-surface" />

      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -70, 40, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-12%] right-[-8%] w-[480px] h-[480px] rounded-full bg-primary/[0.05] blur-[120px] dark:bg-primary/[0.04]"
      />

      <motion.div
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 80, -60, 0],
          scale: [1, 0.92, 1.06, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15%] left-[-10%] w-[560px] h-[560px] rounded-full bg-secondary/[0.05] blur-[140px] dark:bg-secondary/[0.04]"
      />

      <motion.div
        animate={{ opacity: [0.04, 0.055, 0.04], scale: [1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-accent/[0.035] blur-[160px] dark:bg-accent/[0.03]"
      />

      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, var(--color-primary) 0, transparent 1px),
            radial-gradient(circle at 78% 22%, var(--color-secondary) 0, transparent 1px),
            radial-gradient(circle at 40% 80%, var(--color-accent) 0, transparent 1px),
            radial-gradient(circle at 90% 70%, white 0, transparent 1px)`,
          backgroundSize: '120px 120px, 180px 180px, 140px 140px, 100px 100px',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay dark:opacity-[0.04]"
        style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}
      />
    </div>
  );
}
