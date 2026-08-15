/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowSquareOut, ArrowUp, CaretRight, Envelope, Info, ShieldCheck } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';
import SiteFooter from './SiteFooter';
import { PRIVACY_POLICY, type PolicyBlock } from '../content/privacyPolicy';
import { ROUTES, handleLinkClick, navigate } from '../lib/router';

/** Renders one content block. Sub-sections recurse through the same switch. */
function Block({ block, sectionNumber, index }: { block: PolicyBlock; sectionNumber: number; index: number }) {
  switch (block.kind) {
    case 'text':
      return <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed">{block.text}</p>;

    case 'list':
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-accent shrink-0 mt-[7px] md:mt-2" aria-hidden="true" />
              <span className="font-body text-xs md:text-sm text-text-secondary leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'subsection':
      return (
        <div className="bg-surface-2 border border-border-hairline/40 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
          <div>
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              {sectionNumber}.{index}
            </span>
            <h3 className="font-sans font-semibold text-sm text-text-primary mt-1">{block.title}</h3>
          </div>
          {block.blocks.map((child, i) => (
            <Block key={i} block={child} sectionNumber={sectionNumber} index={i + 1} />
          ))}
        </div>
      );

    case 'providers':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {block.items.map((provider) => (
            <a
              key={provider.name}
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-2 border border-border-hairline/40 rounded-2xl p-4 flex flex-col gap-1 hover:border-border-strong/40 transition-colors group"
            >
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{provider.category}</span>
              <span className="font-sans font-semibold text-xs text-text-primary flex items-center gap-1.5 group-hover:text-status-accent transition-colors">
                {provider.name}
                <ArrowSquareOut weight="light" size={12} className="shrink-0" />
              </span>
              <span className="text-[11px] text-text-secondary leading-relaxed mt-0.5">{provider.purpose}</span>
            </a>
          ))}
        </div>
      );

    case 'callout': {
      const tone =
        block.tone === 'success'
          ? { bg: 'bg-status-success-bg', text: 'text-status-success', Icon: ShieldCheck }
          : { bg: 'bg-status-accent-bg', text: 'text-status-accent', Icon: Info };
      const { Icon } = tone;
      return (
        <div className={`${tone.bg} border border-border-hairline/40 rounded-2xl p-4 flex items-start gap-3`}>
          <Icon weight="light" size={18} className={`${tone.text} shrink-0 mt-0.5`} />
          <div>
            <h4 className="font-sans font-semibold text-xs text-text-primary">{block.title}</h4>
            <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed mt-1">{block.text}</p>
          </div>
        </div>
      );
    }
  }
}

export default function PrivacyPolicy() {
  const { title, lastUpdated, intro, contactEmail, sections } = PRIVACY_POLICY;
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const [showJumpTop, setShowJumpTop] = useState(false);

  const pillBarRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Highlight the table-of-contents entry for whichever section is in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: 0 },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Reveal the "jump to top" shortcut once the TOC has scrolled out of reach.
  useEffect(() => {
    const onScroll = () => setShowJumpTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keep the active pill visible in the mobile bar without moving the page.
  useEffect(() => {
    const bar = pillBarRef.current;
    const pill = pillRefs.current[activeSection];
    if (!bar || !pill) return;
    bar.scrollTo({
      left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [activeSection]);

  const goToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-surface-0 text-text-primary" id="climex-privacy-container">
      <div className="ambient-glow" />

      {/* Header — mirrors the dashboard shell, trimmed to what this page needs */}
      <header
        className="sticky top-0 z-30 border-b border-border-hairline bg-surface-0/85 backdrop-blur-md px-3 py-2.5 md:px-6 md:py-4 flex justify-center w-full"
        id="climex-privacy-header"
      >
        <div className="max-w-7xl w-full flex items-center justify-between gap-3 md:gap-6">
          <a
            href={ROUTES.dashboard}
            onClick={handleLinkClick(ROUTES.dashboard)}
            className="flex items-center gap-3 cursor-pointer"
            aria-label="Back to dashboard"
          >
            <div className="relative">
              <img
                src="/img/v1bg.png"
                alt="Climex"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (sibling) {
                    sibling.classList.remove('hidden');
                    sibling.classList.add('flex');
                  }
                }}
                className="h-9 w-auto max-w-[160px] object-contain block transition-transform duration-200 hover:scale-110 active:scale-95"
              />
              <div className="hidden items-center gap-2 px-5 py-1.5 rounded-xl border border-dashed border-border-strong/30 bg-surface-1 text-text-secondary text-xs font-mono tracking-tight font-medium h-9">
                <div className="w-2 h-2 rounded-full bg-status-warning shrink-0" />
                <span>CLIMEX</span>
              </div>
            </div>
          </a>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate(ROUTES.dashboard)}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border border-border-hairline bg-surface-1 text-text-secondary hover:text-text-primary hover:border-border-strong/40 font-sans font-semibold text-xs transition-all active:scale-98 cursor-pointer"
            >
              <ArrowLeft weight="light" size={14} />
              <span className="hidden sm:inline">Back to dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/*
        Compact section nav for small screens — same sticky horizontal pill bar
        the dashboard uses, so the policy body stays near the top of the page
        instead of sitting below a stacked list.
      */}
      <div
        ref={pillBarRef}
        className="lg:hidden sticky top-[57px] md:top-[69px] z-20 w-full overflow-x-auto scrollbar-none border-b border-border-hairline bg-surface-1/90 backdrop-blur-md py-2 px-3 md:py-3 md:px-4 flex items-center gap-1.5 md:gap-2"
        id="privacy-section-pills"
        role="navigation"
        aria-label="Policy sections"
      >
        {sections.map((section, i) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              ref={(el) => {
                pillRefs.current[section.id] = el;
              }}
              onClick={() => goToSection(section.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full font-sans font-semibold text-xs whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-status-warning text-black font-bold shadow-xs'
                  : 'text-text-secondary bg-surface-2 border border-border-hairline/40 hover:text-text-primary'
              }`}
            >
              <span className={`font-mono text-[10px] ${isActive ? 'text-black/70' : 'text-text-muted'}`}>{i + 1}</span>
              <span>{section.title}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 z-10 relative flex flex-col gap-4 md:gap-6">
        {/* Page title stripe — intro sits here so section 1 is the next scroll stop */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 md:gap-4 border-b border-border-hairline pb-3 md:pb-4">
          <div>
            <h1 className="font-sans font-light text-xl md:text-3xl tracking-tight text-text-primary leading-none">
              Privacy <span className="font-medium">Policy</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] md:text-xs font-sans text-text-secondary select-none">
              <a
                href={ROUTES.dashboard}
                onClick={handleLinkClick(ROUTES.dashboard)}
                className="hover:text-text-primary transition-colors cursor-pointer outline-none focus-visible:underline"
              >
                Dashboard
              </a>
              <CaretRight weight="light" size={10} className="text-text-muted" />
              <span className="text-text-primary font-medium">{title}</span>
            </div>
            <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed mt-3 max-w-2xl">{intro}</p>
          </div>
          <span className="font-mono text-[10px] md:text-[11px] text-text-muted uppercase tracking-wider shrink-0">
            Last updated: {lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-slide-up">
          {/* Table of contents — desktop only; mobile uses the pill bar above */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <nav
              className="lg:sticky lg:top-24 border border-border-hairline rounded-3xl bg-surface-1 p-5 shadow-sm"
              aria-label="Policy sections"
            >
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                Contents ({sections.length})
              </span>
              <ul className="flex flex-col mt-3">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <button
                      onClick={() => goToSection(section.id)}
                      aria-current={activeSection === section.id ? 'true' : undefined}
                      className={`w-full text-left flex items-baseline gap-2.5 pl-3 pr-2 py-1.5 border-l-2 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-text-primary/30 rounded-r-md ${
                        activeSection === section.id
                          ? 'border-status-warning text-text-primary font-semibold'
                          : 'border-transparent text-text-secondary hover:text-text-primary font-medium'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-text-muted shrink-0">{i + 1}</span>
                      <span className="font-sans text-[11px] leading-snug">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Policy body */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 md:gap-6">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="border border-border-hairline rounded-3xl bg-surface-1 p-5 md:p-6 shadow-sm scroll-mt-[112px] lg:scroll-mt-24 flex flex-col gap-4"
              >
                <div>
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                    Section {i + 1}
                  </span>
                  <h2 className="font-sans font-semibold text-base md:text-lg text-text-primary mt-1.5">
                    {section.title}
                  </h2>
                </div>

                {section.blocks.map((block, bi) => (
                  <Block key={bi} block={block} sectionNumber={i + 1} index={bi + 1} />
                ))}

                {section.id === 'contact' && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-surface-1 font-sans font-semibold text-xs rounded-full shadow-xs hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                  >
                    <Envelope weight="light" size={14} />
                    {contactEmail}
                  </a>
                )}
              </section>
            ))}
          </div>
        </div>

        <SiteFooter className="mt-6" />
      </main>

      {/* Shortcut back to the top once the section nav is far behind */}
      {showJumpTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-text-primary text-surface-1 font-sans font-semibold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer animate-fade-in"
          aria-label="Jump to top"
        >
          <ArrowUp weight="bold" size={14} />
          <span className="hidden sm:inline">Jump to top</span>
        </button>
      )}
    </div>
  );
}
