/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-line bg-surface dark:bg-surface-muted hover:border-accent hover:text-accent transition-all cursor-pointer text-ink-soft hover:scale-105"
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun weight="light" className="text-lg text-amber-400" size={18} />
      ) : (
        <Moon weight="light" className="text-lg text-zinc-600 dark:text-zinc-400" size={18} />
      )}
    </button>
  );
}
