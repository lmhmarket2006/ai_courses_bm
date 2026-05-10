'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { ACADEMY, CONTACT, COURSE_AVAILABILITY } from '@/lib/config';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground transition-colors duration-300 ease-out hover:text-primary relative group py-1"
    >
      {children}
      <span className="absolute bottom-0 right-0 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full" />
    </a>
  );
}

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-brand-subtle bg-[var(--header-bg)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-4 md:h-[80px] md:px-10 lg:px-12">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="relative w-10 h-10 md:w-12 md:h-12 logo-gradient rounded-xl md:rounded-2xl flex items-center justify-center p-[2px] shadow-lg shrink-0 group hover:scale-105 transition-all duration-500">
            <Image
              src="/assistant-icon.png"
              alt="شعار أكاديمية بيت المصور"
              width={48}
              height={48}
              className="h-full w-full rounded-[9px] object-cover md:rounded-[14px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-extrabold tracking-tight text-foreground border-none truncate">
              {ACADEMY.name}
            </h1>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent font-extrabold">
              Academy
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-2">
            متاح أونلاين: <span className="text-primary font-black">{COURSE_AVAILABILITY.online}</span>
          </div>
          <div className="flex items-center gap-2 border-r border-brand-subtle pr-8">
            حضوري: <span className="text-primary font-black">{COURSE_AVAILABILITY.inPerson}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#about">عن الأكاديمية</NavLink>
          </nav>
          <ThemeToggle />
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="إنستجرام أكاديمية بيت المصور"
            className="btn-premium hidden sm:inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 md:px-7 md:py-3 text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.1em] md:tracking-[0.2em] text-white shadow-[0_12px_32px_-8px_var(--shadow-primary-glow)] transition-all duration-300 ease-out hover:bg-primary-hover hover:scale-[1.02] md:flex"
          >
            <Instagram size={14} className="hidden md:block" aria-hidden="true" />
            <span className="max-w-[120px] md:max-w-none truncate">انستجرام الأكاديمية</span>
          </a>
        </div>
      </div>
    </header>
  );
}
