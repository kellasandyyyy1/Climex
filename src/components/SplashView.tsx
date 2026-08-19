/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, Globe, ArrowsLeftRight, MapPin } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES, handleLinkClick } from '../lib/router';

interface SplashViewProps {
  onLaunch: () => void;
}

export default function SplashView({ onLaunch }: SplashViewProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  return (
    <div className="relative min-h-screen md:h-screen flex flex-col md:flex-row bg-surface-0 overflow-y-auto md:overflow-hidden scroll-smooth" id="climex-splash-container">
      {/* Mobile background image */}
      <div className="absolute inset-0 md:hidden pointer-events-none z-0">
        <img
          src="/img/banner2.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.76]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0/10 via-surface-0/30 to-surface-0" />
      </div>

      {/* Left Panel: Welcome and Content */}
      <div className="flex-1 flex flex-col justify-start p-8 sm:p-12 md:p-16 z-10 relative bg-surface-0/90 backdrop-blur-md md:bg-surface-0 md:h-screen md:overflow-y-auto scroll-smooth scrollbar-none gap-y-12">
        {/* Logomark / Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/img/v1textwhite.png"
              alt="Logo"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                if (sibling) {
                  sibling.classList.remove('hidden');
                  sibling.classList.add('flex');
                }
              }}
              className="h-9 w-auto max-w-[160px] object-contain block"
            />
            <div className="hidden items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-border-strong/30 bg-surface-1 text-text-secondary text-xs font-mono tracking-tight font-medium h-9">
              <img
                src="/img/v1blacklogo.png"
                alt="Logo"
                className="h-full w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="max-w-lg flex flex-col items-start pt-4 sm:pt-6">
          <h1 className="font-sans font-light text-5xl sm:text-6xl tracking-tight text-text-primary leading-[1.05] mt-6">
            Live data,<br />
            <span className="font-bold">one dashboard.</span>
          </h1>
          <p className="font-body text-text-secondary text-sm sm:text-base leading-relaxed mt-4">
            Crypto, weather, currency, and air quality updated in real time, in one view.
          </p>

          <div className="mt-8 flex flex-col items-start gap-6 w-full">
            <button
              onClick={() => onLaunch()}
              id="splash-launch-btn"
              className="inline-flex items-center gap-1.5 pb-0.5 border-b-2 border-text-primary/70 hover:border-text-primary text-[17px] font-medium text-text-primary transition-all duration-150 hover:-translate-y-[1px] cursor-pointer group select-none bg-transparent border-t-0 border-x-0 outline-none"
            >
              Launch dashboard
              <ArrowUpRight weight="regular" className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <div className="relative mt-1">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  // Smooth scroll to element
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-[11px] font-sans font-medium text-text-muted hover:text-text-primary hover:underline transition-all cursor-pointer inline-flex items-center gap-1"
              >
                How it works
              </a>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-3.5 w-64 p-3.5 bg-surface-1 border border-border-hairline rounded-2xl shadow-xl text-[11px] text-text-secondary leading-relaxed font-sans z-30 pointer-events-none text-left animate-fade-in"
                  >
                    Climex connects to live crypto, weather, and currency sources, brings them into one screen, and updates automatically — no setup needed.
                    <div className="absolute top-full left-4 w-2.5 h-2.5 bg-surface-1 border-r border-b border-border-hairline/60 rotate-45 -translate-y-[5px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* New "How it works" Section */}
        <div id="how-it-works" className="py-12 border-t border-border-hairline/60 max-w-lg animate-fade-in scroll-mt-12">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-text-secondary/60 mb-2">HOW IT WORKS</span>
          <h2 className="font-sans font-light text-2xl tracking-tight text-text-primary mb-10">Three steps, no setup.</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-text-primary/5 text-text-primary flex items-center justify-center font-sans font-semibold text-xs">
                1
              </div>
              <p className="font-sans font-medium text-xs text-text-primary mt-1">We connect to live sources</p>
              <p className="text-[11px] text-text-secondary/70 leading-relaxed">
                Climex pulls prices, weather, and air quality from trusted providers every few seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-text-primary/5 text-text-primary flex items-center justify-center font-sans font-semibold text-xs">
                2
              </div>
              <p className="font-sans font-medium text-xs text-text-primary mt-1">It lands on one screen</p>
              <p className="text-[11px] text-text-secondary/70 leading-relaxed">
                No tabs, no switching apps. Crypto, currency, weather, and air quality sit side by side.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-text-primary/5 text-text-primary flex items-center justify-center font-sans font-semibold text-xs">
                3
              </div>
              <p className="font-sans font-medium text-xs text-text-primary mt-1">You just watch it update</p>
              <p className="text-[11px] text-text-secondary/70 leading-relaxed">
                Numbers refresh on their own. Open the dashboard and it's already current.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info / stat row */}
        <div className="pt-8 pb-6 flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] font-mono text-text-secondary/70 border-t border-border-hairline/30 mt-auto">
          <span>
            Developed by{' '}
            <a
              href="https://seb.kelas.site"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-text-primary transition-colors duration-150"
            >
              andrei
            </a>
          </span>
          {/* Shown here because the browser location prompt appears on this screen */}
          <span className="flex items-center gap-1.5">
            <MapPin weight="light" size={12} className="shrink-0" />
            Asks for your location —{' '}
            <a
              href={ROUTES.privacy}
              onClick={handleLinkClick(ROUTES.privacy)}
              className="underline hover:text-text-primary transition-colors duration-150"
            >
              privacy policy
            </a>
          </span>
        </div>
      </div>

      {/* Right Panel: Full-bleed placeholder image banner */}
      <div className="hidden md:block flex-1 bg-zinc-950 relative overflow-hidden md:border-l border-zinc-900 md:min-h-screen">
        {/* Placeholder image that spans the entire panel */}
        <img
          src="/img/banner2.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-65"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40 pointer-events-none" />

        {/* Elegant Placeholder Overlay Info */}
        <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
          <div className="">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase"></span>
            <p className="font-sans font-light text-xs text-zinc-300 leading-relaxed">

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
