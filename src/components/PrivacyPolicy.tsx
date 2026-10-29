/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CaretLeft, CaretDown, CheckCircle, EnvelopeSimple } from './Icon';

const PRIVACY_CONTACT = 'support@climex-analytics.com';

const PRIVACY_KEY_POINTS = [
  'We never sell, share or advertise with your data.',
  'Your location is used only to fetch local weather and air quality, and is never stored on our servers.',
  'Preferences such as units, currency and your display name stay in your browser.',
  'No cross-site tracking. Location access is optional and can be revoked anytime.',
];

const PRIVACY_SECTIONS: Array<{ id: string; title: string; summary: string; body: React.ReactNode }> = [
  {
    id: 'privacy-overview',
    title: 'Our approach to data',
    summary: 'Client-first, minimal data, explicit consent.',
    body: (
      <p>
        Climex is built as a client-side analytics and monitoring dashboard. We prioritize a minimal data footprint, zero
        cross-site tracking, and explicit consent for every interactive capability.
      </p>
    ),
  },
  {
    id: 'privacy-location',
    title: 'Location data',
    summary: 'Used only with your permission, never stored or sold.',
    body: (
      <>
        <p>
          Climex requests your device location, with your permission, to display accurate local weather and air quality
          readings.
        </p>
        <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-text-muted">
          <li>We only use it to fetch data from our weather and air quality providers (e.g. Open-Meteo, OpenAQ).</li>
          <li>Your location is not stored on our servers.</li>
          <li>
            So the installed app doesn't ask again, your approximate position (rounded to two decimal places, about 1 km) and
            the nearest monitored city are saved on this device only.
          </li>
          <li>Your location is not shared, sold, or used for advertising.</li>
          <li>You can decline location access and search for a city manually instead.</li>
          <li>You can revoke location permission anytime in your browser or device settings.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'privacy-providers',
    title: 'Third-party data providers',
    summary: 'Public APIs, without personal identifiers.',
    body: (
      <p>
        To deliver real-time market prices, exchange rates and air quality readings, Climex connects to verified public
        APIs (CoinGecko, Open-Meteo, Frankfurter, REST Countries). Requests are made directly or through our server proxy
        without sending personal identifiers.
      </p>
    ),
  },
  {
    id: 'privacy-storage',
    title: 'Local storage and settings',
    summary: 'Your preferences live only in this browser.',
    body: (
      <p>
        Your preferences, including temperature unit (°C/°F), base currency, price alert setting, display name and saved
        profile location, are stored only in your browser's local storage (<code className="text-[13px] px-1 py-0.5 rounded bg-surface-2 border border-border-hairline">localStorage</code>).
        You can clear this data at any time with your browser's site-data tools.
      </p>
    ),
  },
  {
    id: 'privacy-offline',
    title: 'Offline storage and the installed app',
    summary: 'Recent data is saved on your device so Climex works offline.',
    body: (
      <>
        <p>
          When you use Climex in a browser that supports it, or install it as an app, a copy of recent data is kept on your
          device so pages load quickly and still work without a connection.
        </p>
        <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-text-muted">
          <li>
            <span className="font-medium text-text-primary">What's saved:</span> market prices (kept up to 2 minutes before it's
            marked stale), weather (15 minutes), air quality (30 minutes), exchange rates (1 hour), country statistics (30
            days), recent alerts (1 day), plus flags, coin logos and fonts (up to a year). The most recent copy of each is also
            kept so the dashboard can show your last data offline, labelled with when it was saved.
          </li>
          <li>
            <span className="font-medium text-text-primary">Saved location:</span> your approximate position, rounded to two
            decimal places (about 1 km), and the nearest monitored city.
          </li>
          <li>
            <span className="font-medium text-text-primary">Where it lives:</span> only on your device. None of it is sent back to
            Climex or shared with anyone.
          </li>
          <li>
            <span className="font-medium text-text-primary">How to remove it:</span> clear this site's data in your browser's
            settings (often under Privacy → Site data), or uninstall the Climex app. Both delete the saved data and location.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'privacy-contact',
    title: 'Questions and contact',
    summary: 'Email us about anything privacy-related.',
    body: (
      <p>
        If you have questions about how we handle data, contact us at{' '}
        <a href={`mailto:${PRIVACY_CONTACT}`} className="text-text-primary font-medium underline underline-offset-2 decoration-border-strong hover:decoration-text-primary">
          {PRIVACY_CONTACT}
        </a>
        .
      </p>
    ),
  },
];

/** Privacy policy as a readable document: key points, sticky table of contents (desktop), accordion (mobile). */
export default function PrivacyPolicy({ onBack }: { onBack: (e: React.MouseEvent) => void }) {
  const [privacyActiveId, setPrivacyActiveId] = useState(PRIVACY_SECTIONS[0].id);

  // Scroll-spy for the desktop table of contents
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setPrivacyActiveId(visible[0].target.id.replace(/-doc$/, ''));
      },
      { rootMargin: '-96px 0px -60% 0px' }
    );
    PRIVACY_SECTIONS.forEach(s => {
      const el = document.getElementById(`${s.id}-doc`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const contactButton = (
    <a href={`mailto:${PRIVACY_CONTACT}`} className="btn btn-primary h-11 md:h-9">
      <EnvelopeSimple size={16} aria-hidden="true" />
      Contact support
    </a>
  );

  return (
    <div className="animate-slide-up w-full" id="privacy-policy-view">
      {/* Top bar: back link + effective date */}
      <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
        <a href="/" onClick={onBack} className="btn btn-ghost -ml-3 h-11 md:h-9">
          <CaretLeft size={16} aria-hidden="true" />
          Back to dashboard
        </a>
        <span className="text-[13px] text-text-muted">Effective August 2026</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)] gap-6 md:gap-10">
        {/* Desktop: sticky table of contents */}
        <nav className="hidden md:block" aria-label="On this page">
          <div className="sticky top-24">
            <p className="eyebrow mb-2">On this page</p>
            <ul className="flex flex-col gap-0.5 border-l border-border-hairline">
              {PRIVACY_SECTIONS.map(s => {
                const active = privacyActiveId === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}-doc`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`${s.id}-doc`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setPrivacyActiveId(s.id);
                      }}
                      aria-current={active ? 'location' : undefined}
                      className={`block -ml-px pl-3 py-1.5 border-l-2 text-[14px] leading-snug transition-colors ${active ? 'border-text-primary text-text-primary font-medium' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 max-w-[70ch]">
          {/* Key points summary */}
          <section className="card card-pad" aria-labelledby="privacy-key-points-title">
            <h2 id="privacy-key-points-title" className="card-title">The short version</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {PRIVACY_KEY_POINTS.map(p => (
                <li key={p} className="flex items-start gap-2.5 text-[14px] text-text-secondary leading-relaxed">
                  <CheckCircle size={18} weight="fill" className="text-status-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Mobile: sections as an accordion */}
          <div className="md:hidden mt-4 card divide-y divide-border-hairline overflow-hidden">
            {PRIVACY_SECTIONS.map(s => (
              <details key={s.id} id={s.id} className="group">
                <summary className="flex items-center justify-between gap-3 min-h-[56px] px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-text-primary">{s.title}</span>
                    <span className="block text-[13px] text-text-muted mt-0.5">{s.summary}</span>
                  </span>
                  <CaretDown size={16} className="shrink-0 text-text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-4 pb-4 text-[15px] text-text-secondary leading-relaxed">{s.body}</div>
              </details>
            ))}
          </div>

          {/* Desktop: full document */}
          <article className="hidden md:block mt-10 text-[15px] text-text-secondary leading-[1.7]">
            {PRIVACY_SECTIONS.map((s, i) => (
              <section key={s.id} id={`${s.id}-doc`} className={`scroll-mt-24 ${i > 0 ? 'mt-10 pt-10 border-t border-border-hairline' : ''}`}>
                <h2 className="text-[18px] font-semibold text-text-primary tracking-tight mb-3">{s.title}</h2>
                {s.body}
              </section>
            ))}
          </article>

          {/* Contact call-to-action */}
          <div className="mt-6 md:mt-10 card card-pad flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-text-primary">Questions about your data?</p>
              <p className="text-[13px] text-text-secondary mt-0.5">Email {PRIVACY_CONTACT}</p>
            </div>
            {contactButton}
          </div>
        </div>
      </div>
    </div>
  );
}
