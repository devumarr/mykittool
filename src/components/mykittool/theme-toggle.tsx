"use client"

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-xl bg-secondary/50 border border-white/5 transition-all hover:text-primary active:scale-95",
        "text-foreground/40"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      ) : (
        <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      )}
    </button>
  );
}
