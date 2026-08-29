'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (isDark) {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
    localStorage.setItem('sahakargig_theme', 'dark');
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
    localStorage.setItem('sahakargig_theme', 'light');
  }
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sahakargig_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(initialDark);
    applyTheme(initialDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    applyTheme(nextDark);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center group"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Dark / Light Mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
