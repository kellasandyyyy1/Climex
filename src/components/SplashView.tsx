/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, MapPin } from './Icon';
import { motion } from 'motion/react';
import StatusBadge, { aqiTone } from './StatusBadge';
import Wordmark from './Wordmark';
import { pathForTab, isModifiedClick } from '../lib/routes';

interface SplashViewProps {
  onLaunch: () => void;
  /** Opens the privacy policy in-app (plain clicks only). */
  onOpenPrivacy?: () => void;
}

interface LiveSnapshot {
  btc?: { price: number; change24h: number };
  weather?: { city: string; temp: number; condition: string };
  aqi?: { city: string; aqi: number; status: string };
}

const STEPS = [
  {
    title: 'We connect to live sources',
    body: 'Climex pulls prices, weather, and air quality from trusted providers every few seconds.',
  },
  {
    title: 'It lands on one screen',
    body: 'No tabs, no switching apps. Crypto, currency, weather, and air quality sit side by side.',
  },
  {
    title: 'You just watch it update',
    body: "Numbers refresh on their own. Open the dashboard and it's already current.",
  },
];


const rise = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } }),
};

type LiveStatus = 'loading' | 'live' | 'error';

/** Reads the dashboard API so the landing page can show real numbers; retries a few times, then reports an error. */
function useLiveSnapshot(): { snap: LiveSnapshot | null; status: LiveStatus; retry: () => void } {
  const [snap, setSnap] = React.useState<LiveSnapshot | null>(null);
  const [status, setStatus] = React.useState<LiveStatus>('loading');
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    setStatus('loading');
    fetch('/api/dashboard', { signal: controller.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(json => {
        if (cancelled) return;
        const pick = (list: any[] | undefined, city = 'Manila') => list?.find(x => x.city === city) ?? list?.[0];
        const btc = json.crypto?.find((c: any) => c.id === 'bitcoin') ?? json.crypto?.[0];
        const w = pick(json.weather);
        const a = pick(json.aqi);
        setSnap({
          btc: btc && { price: btc.price, change24h: btc.change24h },
          weather: w && { city: w.city, temp: w.temp, condition: w.condition },
          aqi: a && { city: a.city, aqi: a.aqi, status: a.status },
        });
        setStatus('live');
      })
      .catch(() => {
        if (cancelled) return;
        // Quietly retry twice (the first request can be slow while the server warms its caches)
        if (attempt < 2) setTimeout(() => !cancelled && setAttempt(n => n + 1), 3000);
        else setStatus('error');
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [attempt]);
  return { snap, status, retry: () => setAttempt(n => (n >= 2 ? 3 : n + 1)) };
}

function LiveStrip({ snap, status, retry }: { snap: LiveSnapshot | null; status: LiveStatus; retry: () => void }) {
  const cell = 'flex flex-col gap-1 min-w-0 px-3 sm:px-4 py-3';
  const skeleton =
    status === 'error' ? <span className="text-text-muted">—</span> : <span className="block h-5 w-20 rounded bg-surface-2 animate-pulse" />;
  return (
    <div className="card" aria-live="polite">
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3">
        <span className="eyebrow">Right now</span>
        {status === 'error' && !snap ? (
          <button onClick={retry} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary cursor-pointer">
            <StatusBadge tone="critical" size="xs">Unavailable</StatusBadge>
            <span className="underline underline-offset-2">Retry</span>
          </button>
        ) : (
          <StatusBadge tone={snap ? 'success' : 'neutral'} size="xs">
            {snap ? 'Live' : 'Connecting'}
          </StatusBadge>
        )}
      </div>
      <dl className="grid grid-cols-3 divide-x divide-border-hairline">
        <div className={cell}>
          <dt className="text-[12.5px] text-text-muted">Bitcoin</dt>
          <dd className="text-[15px] sm:text-[17px] font-semibold text-text-primary tabular-nums truncate">
            {snap?.btc ? `$${Math.round(snap.btc.price).toLocaleString()}` : skeleton}
          </dd>
          {snap?.btc && (
            <dd className={`text-[12.5px] font-medium tabular-nums ${snap.btc.change24h >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
              {snap.btc.change24h >= 0 ? '▲' : '▼'} {Math.abs(snap.btc.change24h).toFixed(2)}%
            </dd>
          )}
        </div>
        <div className={cell}>
          <dt className="text-[12.5px] text-text-muted truncate">{snap?.weather?.city ?? 'Weather'}</dt>
          <dd className="text-[15px] sm:text-[17px] font-semibold text-text-primary tabular-nums">
            {snap?.weather ? `${Math.round(snap.weather.temp)}°C` : skeleton}
          </dd>
          {snap?.weather && <dd className="text-[12.5px] text-text-secondary truncate">{snap.weather.condition}</dd>}
        </div>
        <div className={cell}>
          <dt className="text-[12.5px] text-text-muted truncate">Air quality</dt>
          <dd className="text-[15px] sm:text-[17px] font-semibold text-text-primary tabular-nums">
            {snap?.aqi ? `${snap.aqi.aqi} AQI` : skeleton}
          </dd>
          {snap?.aqi && (
            <dd>
              <StatusBadge {...aqiTone(snap.aqi.status)} size="xs">
                {snap.aqi.status === 'Unhealthy for Sensitive Groups' ? 'Sensitive' : snap.aqi.status}
              </StatusBadge>
            </dd>
          )}
        </div>
      </dl>
    </div>
  );
}

export default function SplashView({ onLaunch, onOpenPrivacy }: SplashViewProps) {
  const { snap, status, retry } = useLiveSnapshot();
  const scrollToHow = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grain-bg min-h-screen text-text-primary flex flex-col" id="climex-splash-container">
      {/* Top bar */}
      <header className="app-header sticky top-0 z-20 bg-surface-0/55 backdrop-blur-md border-b border-border-hairline/70">
        <div className="mx-auto max-w-[1200px] h-full px-4 md:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 -ml-1 px-1 py-1 rounded-lg" aria-label="Climex">
            <Wordmark className="h-[17px] md:h-[19px]" />
          </a>
          <nav className="flex items-center gap-1">
            <a href="#how-it-works" onClick={scrollToHow} className="hidden sm:inline-flex btn btn-ghost btn-sm">
              How it works
            </a>
            <button onClick={onLaunch} className="btn btn-secondary btn-sm">
              Open dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-4 md:px-8 pt-10 md:pt-20 pb-12 md:pb-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] gap-10 lg:gap-14 items-center">
          <div className="max-w-[560px]">
            <motion.p custom={0} variants={rise} initial="hidden" animate="show" className="eyebrow text-accent">
              Markets &amp; climate, live
            </motion.p>
            <motion.h1
              custom={1}
              variants={rise}
              initial="hidden"
              animate="show"
              className="font-display font-normal text-[44px] leading-[1.02] sm:text-[56px] md:text-[68px] tracking-[-0.025em] mt-4"
            >
              Live data,
              <br />
              one dashboard.
            </motion.h1>
            <motion.p custom={2} variants={rise} initial="hidden" animate="show" className="mt-5 text-[17px] md:text-[19px] leading-relaxed text-text-secondary max-w-[460px]">
              Crypto, weather, currency, and air quality updated in real time, in one view.
            </motion.p>

            <motion.div custom={3} variants={rise} initial="hidden" animate="show" className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <button onClick={onLaunch} id="splash-launch-btn" className="btn btn-primary btn-lg w-full sm:w-auto group">
                Launch dashboard
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#how-it-works" onClick={scrollToHow} className="btn btn-ghost btn-lg w-full sm:w-auto">
                How it works
              </a>
            </motion.div>

            <motion.div custom={4} variants={rise} initial="hidden" animate="show" className="mt-10">
              <LiveStrip snap={snap} status={status} retry={retry} />
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden border border-border-hairline bg-[#F2EEE4] shadow-sm aspect-[1451/1084]"
          >
            <img
              src="/img/new%20banner.png"
              alt="A globe linked to live Bitcoin, USD/EUR and New York weather cards"
              width={1451}
              height={1084}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.figure>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border-hairline scroll-mt-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-12 md:py-20">
            <div className="grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-8 md:gap-12 lg:gap-16">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 className="font-display font-normal text-[30px] md:text-[34px] leading-tight tracking-[-0.02em] mt-3 text-balance">Three steps, no setup.</h2>
              </div>
              <ol className="grid sm:grid-cols-3 gap-px bg-border-hairline rounded-2xl overflow-hidden border border-border-hairline">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="bg-surface-1 p-5 md:p-6 flex flex-row sm:flex-col gap-4 sm:gap-6">
                    <span className="font-display text-[28px] md:text-[34px] leading-none text-accent tabular-nums shrink-0 w-7 sm:w-auto">{i + 1}</span>
                    <div>
                      <p className="text-[15px] font-semibold text-text-primary leading-snug">{step.title}</p>
                      <p className="text-[14px] text-text-secondary leading-relaxed mt-1.5">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-10 md:mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-surface-2 border border-border-hairline px-5 md:px-6 py-5">
              <div>
                <p className="text-[16px] font-semibold text-text-primary">Everything is already live.</p>
                <p className="text-[14px] text-text-secondary mt-0.5">No account, no setup — the numbers are current when you open it.</p>
              </div>
              <button onClick={onLaunch} className="btn btn-primary w-full sm:w-auto shrink-0">
                Launch dashboard
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-hairline">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px] text-text-muted">
          <span>© {new Date().getFullYear()} Climex</span>
          <span>
            Developed by{' '}
            <a
              href="https://seb.kelas.site"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-text-secondary underline decoration-border-strong underline-offset-2 hover:text-text-primary transition-colors"
            >
              andrei
            </a>
          </span>
          {/* Shown here because the browser location prompt appears on this screen */}
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0" />
            Asks for your location —{' '}
            <a
              href={pathForTab('privacy')}
              onClick={(e) => {
                if (!onOpenPrivacy || isModifiedClick(e)) return;
                e.preventDefault();
                onOpenPrivacy();
              }}
              className="font-medium text-text-secondary underline decoration-border-strong underline-offset-2 hover:text-text-primary transition-colors"
            >
              privacy policy
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
