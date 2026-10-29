/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CaretLeft, CaretDown, CheckCircle, EnvelopeSimple, Info } from './Icon';
import { PRIVACY_POLICY, type PolicyBlock } from '../content/privacyPolicy';

/**
 * Privacy policy page. The text lives in src/content/privacyPolicy.ts; this file only lays it out:
 * a numbered, sticky table of contents on desktop and a numbered accordion on mobile.
 */

const { sections, contactEmail, lastUpdated } = PRIVACY_POLICY;

/** Pulls the "short version" call-out out of the overview so it can lead the page. */
const SHORT_VERSION = sections
  .flatMap(s => s.blocks)
  .find((b): b is Extract<PolicyBlock, { kind: 'callout' }> => b.kind === 'callout' && b.title === 'The short version');

function Block({ block, section, index }: { block: PolicyBlock; section: number; index: number }) {
  switch (block.kind) {
    case 'text':
      return <p>{block.text}</p>;

    case 'list':
      return (
        <ul className="space-y-2 list-disc pl-5 marker:text-text-muted">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'subsection':
      return (
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary tracking-tight mb-2">
            <span className="text-text-muted tabular-nums mr-1.5">{section}.{index}</span>
            {block.title}
          </h3>
          <div className="flex flex-col gap-3">
            {block.blocks.map((child, i) => (
              <React.Fragment key={i}>
                <Block block={child} section={section} index={i + 1} />
              </React.Fragment>
            ))}
          </div>
        </div>
      );

    case 'providers':
      return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {block.items.map(p => (
            <li key={p.name}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-lg border border-border-hairline bg-surface-1 px-3.5 py-3 hover:border-border-strong transition-colors"
              >
                <span className="block text-[12px] text-text-muted">{p.category}</span>
                <span className="block text-[14px] font-semibold text-text-primary mt-0.5">{p.name} ↗</span>
                <span className="block text-[13px] text-text-secondary leading-snug mt-1">{p.purpose}</span>
              </a>
            </li>
          ))}
        </ul>
      );

    case 'callout': {
      if (block === SHORT_VERSION) return null; // shown at the top of the page instead
      const Icon = block.tone === 'success' ? CheckCircle : Info;
      return (
        <div className="flex items-start gap-3 rounded-lg bg-surface-2 border border-border-hairline px-4 py-3">
          <Icon size={18} className={`shrink-0 mt-0.5 ${block.tone === 'success' ? 'text-status-success' : 'text-status-info'}`} aria-hidden="true" />
          <div>
            <p className="text-[14px] font-semibold text-text-primary">{block.title}</p>
            <p className="text-[14px] text-text-secondary leading-relaxed mt-0.5">{block.text}</p>
          </div>
        </div>
      );
    }
  }
}

function SectionBody({ index }: { index: number }) {
  // Subsections are numbered by their position among subsections (2.1, 2.2 …), not among all blocks
  let sub = 0;
  return (
    <div className="flex flex-col gap-4">
      {sections[index].blocks.map((b, i) => (
        <React.Fragment key={i}>
          <Block block={b} section={index + 1} index={b.kind === 'subsection' ? ++sub : 0} />
        </React.Fragment>
      ))}
      {sections[index].id === 'contact' && (
        <p>
          <a href={`mailto:${contactEmail}`} className="text-text-primary font-medium underline underline-offset-2 decoration-border-strong hover:decoration-text-primary">
            {contactEmail}
          </a>
        </p>
      )}
    </div>
  );
}

export default function PrivacyPolicy({ onBack }: { onBack: (e: React.MouseEvent) => void }) {
  const [activeId, setActiveId] = useState(sections[0].id);

  // Scroll-spy for the desktop table of contents
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id.replace(/-doc$/, ''));
      },
      { rootMargin: '-96px 0px -60% 0px' }
    );
    sections.forEach(s => {
      const el = document.getElementById(`${s.id}-doc`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-slide-up w-full" id="privacy-policy-view">
      {/* Top bar: back link + last updated */}
      <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
        <a href="/" onClick={onBack} className="btn btn-ghost -ml-3 h-11 md:h-9">
          <CaretLeft size={16} aria-hidden="true" />
          Back to dashboard
        </a>
        <span className="text-[13px] text-text-muted">Last updated {lastUpdated}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 md:gap-10">
        {/* Desktop: sticky, numbered table of contents */}
        <nav className="hidden md:block" aria-label="On this page">
          <div className="sticky top-24">
            <p className="eyebrow mb-2">Contents</p>
            <ol className="flex flex-col gap-0.5 border-l border-border-hairline">
              {sections.map((s, i) => {
                const active = activeId === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}-doc`}
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(`${s.id}-doc`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveId(s.id);
                      }}
                      aria-current={active ? 'location' : undefined}
                      className={`flex gap-2 -ml-px pl-3 py-1.5 border-l-2 text-[14px] leading-snug transition-colors ${active ? 'border-text-primary text-text-primary font-medium' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                      <span className="tabular-nums text-text-muted w-5 shrink-0">{i + 1}.</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 max-w-[72ch]">
          {/* Short version */}
          {SHORT_VERSION && (
            <section className="card card-pad flex items-start gap-3" aria-labelledby="privacy-short-version">
              <CheckCircle size={20} weight="fill" className="text-status-success shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 id="privacy-short-version" className="card-title">{SHORT_VERSION.title}</h2>
                <p className="text-[14px] text-text-secondary leading-relaxed mt-1">{SHORT_VERSION.text}</p>
              </div>
            </section>
          )}

          {/* Mobile: numbered accordion */}
          <div className="md:hidden mt-4 card divide-y divide-border-hairline overflow-hidden">
            {sections.map((s, i) => (
              <details key={s.id} id={s.id} className="group">
                <summary className="flex items-center justify-between gap-3 min-h-[52px] px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex gap-2 text-[15px] font-medium text-text-primary">
                    <span className="tabular-nums text-text-muted w-5 shrink-0">{i + 1}.</span>
                    {s.title}
                  </span>
                  <CaretDown size={16} className="shrink-0 text-text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-4 pb-4 text-[15px] text-text-secondary leading-relaxed">
                  <SectionBody index={i} />
                </div>
              </details>
            ))}
          </div>

          {/* Desktop: full document */}
          <article className="hidden md:block mt-10 text-[15px] text-text-secondary leading-[1.7]">
            {sections.map((s, i) => (
              <section key={s.id} id={`${s.id}-doc`} className={`scroll-mt-24 ${i > 0 ? 'mt-10 pt-10 border-t border-border-hairline' : ''}`}>
                <h2 className="text-[19px] font-semibold text-text-primary tracking-tight mb-4">
                  <span className="text-text-muted tabular-nums mr-2">{i + 1}.</span>
                  {s.title}
                </h2>
                <SectionBody index={i} />
              </section>
            ))}
          </article>

          {/* Contact call-to-action */}
          <div className="mt-6 md:mt-10 card card-pad flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-text-primary">Questions about your data?</p>
              <p className="text-[13px] text-text-secondary mt-0.5">Email {contactEmail}</p>
            </div>
            <a href={`mailto:${contactEmail}`} className="btn btn-primary h-11 md:h-9">
              <EnvelopeSimple size={16} aria-hidden="true" />
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
