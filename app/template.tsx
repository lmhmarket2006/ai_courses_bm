'use client';

import { motion } from 'motion/react';
import { pageVariants } from '@/lib/motion-variants';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="initial" animate="animate" variants={pageVariants}>
      {children}
    </motion.div>
  );
}
