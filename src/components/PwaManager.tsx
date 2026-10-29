/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X } from './Icon';
import { FEATURES, VAPID_PUBLIC_KEY } from '../lib/features';

/**
 * Service worker registration plus the three PWA prompts:
 *  - update toast ("A new version of Climex is available" → Refresh, never automatic)
 *  - install card (after real use; dismissal remembered for 14 days)
 *  - one-time iOS "Add to Home Screen" hint
 */

const DISMISS_KEY = 'climex-install-dismissed-at';
const VISITS_KEY = 'climex-visits';
const IOS_HINT_KEY = 'climex-ios-hint-seen';
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;
const ENGAGED_AFTER_MS = 30 * 1000;
const UPDATE_CHECK_MS = 60 * 60 * 1000;

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    // ignore
  }
};

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    (navigator as any).standalone === true);

const isIosSafari = () => {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
};

/** Opt-in for crypto price alert pushes. Call only from a user action (e.g. a Settings switch). */
export async function enablePriceAlertPush(): Promise<PushSubscription | null> {
  if (!FEATURES.pushAlerts || !VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  if ((await Notification.requestPermission()) !== 'granted') return null;
  const reg = await navigator.serviceWorker.ready;
  const key = Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
  return sub;
}

function Toast({ children, onClose, label }: { children: React.ReactNode; onClose?: () => void; label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="pointer-events-auto card w-full sm:w-[380px] p-4 flex items-start gap-3 shadow-lg animate-slide-up"
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm -mr-1.5 -mt-1.5 shrink-0" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default function PwaManager() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [engaged, setEngaged] = useState(false);
  const [installHidden, setInstallHidden] = useState(() => {
    const at = Number(read(DISMISS_KEY) || 0);
    return isStandalone() || (at > 0 && Date.now() - at < DISMISS_FOR_MS);
  });
  const [iosHint, setIosHint] = useState(false);
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      registrationRef.current = registration;
      // Optional: refresh cached data in the background (Chromium, installed app, permission granted)
      if (FEATURES.periodicSync && 'periodicSync' in registration) {
        (navigator.permissions as any)
          ?.query({ name: 'periodic-background-sync' })
          .then((status: PermissionStatus) => {
            if (status.state === 'granted') return (registration as any).periodicSync.register('climex-refresh', { minInterval: 15 * 60 * 1000 });
          })
          .catch(() => undefined);
      }
    },
    onRegisterError(error) {
      console.warn('Service worker registration failed', error);
    },
  });

  // Check for a new version on focus and every hour
  useEffect(() => {
    const check = () => registrationRef.current?.update().catch(() => undefined);
    const onFocus = () => document.visibilityState === 'visible' && check();
    const timer = setInterval(check, UPDATE_CHECK_MS);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // "Ready to work offline" confirmation after the first install of the service worker
  useEffect(() => {
    if (!offlineReady) return;
    setShowOfflineReady(true);
    const t = setTimeout(() => {
      setShowOfflineReady(false);
      setOfflineReady(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [offlineReady]);

  // Engagement: a second visit, or 30 seconds of use in this one
  useEffect(() => {
    let visits = Number(read(VISITS_KEY) || 0);
    try {
      if (!sessionStorage.getItem('climex-visit-counted')) {
        visits += 1;
        write(VISITS_KEY, String(visits));
        sessionStorage.setItem('climex-visit-counted', '1');
      }
    } catch {
      // ignore
    }
    if (visits >= 2) {
      setEngaged(true);
      return;
    }
    const t = setTimeout(() => setEngaged(true), ENGAGED_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  // Install prompt capture (Chromium) and installed detection
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // suppress the default mini-infobar; we show our own card
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setInstallHidden(true);
      setIosHint(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // iOS Safari has no install event: one-time hint
  useEffect(() => {
    if (engaged && !isStandalone() && isIosSafari() && !read(IOS_HINT_KEY)) setIosHint(true);
  }, [engaged]);

  const dismissInstall = () => {
    write(DISMISS_KEY, String(Date.now()));
    setInstallHidden(true);
  };
  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
    if (choice?.outcome !== 'accepted') dismissInstall();
  };
  const closeIosHint = () => {
    write(IOS_HINT_KEY, '1');
    setIosHint(false);
  };

  const showInstall = !!installEvent && engaged && !installHidden && !isStandalone();

  if (!needRefresh && !showInstall && !iosHint && !showOfflineReady) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none flex flex-col items-center sm:items-end gap-2 px-3 sm:px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5">
      {needRefresh && (
        <Toast label="Update available">
          <p className="text-[14px] font-semibold text-text-primary">A new version of Climex is available</p>
          <p className="text-[13px] text-text-secondary mt-0.5">Refresh to get the latest improvements.</p>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm" onClick={() => updateServiceWorker(true)}>
              Refresh
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setNeedRefresh(false)}>
              Later
            </button>
          </div>
        </Toast>
      )}

      {showInstall && (
        <Toast label="Install Climex" onClose={dismissInstall}>
          <div className="flex items-start gap-3">
            <img src="/icons/pwa-64x64.png" alt="" width={40} height={40} className="w-10 h-10 rounded-[10px] shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-text-primary">Install Climex</p>
              <p className="text-[13px] text-text-secondary mt-0.5">Open it like an app and keep your last data available offline.</p>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm" onClick={install}>
                  Install
                </button>
                <button className="btn btn-ghost btn-sm" onClick={dismissInstall}>
                  Not now
                </button>
              </div>
            </div>
          </div>
        </Toast>
      )}

      {iosHint && (
        <Toast label="Add Climex to your Home Screen" onClose={closeIosHint}>
          <p className="text-[14px] font-semibold text-text-primary">Add Climex to your Home Screen</p>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Tap <span className="font-medium text-text-primary">Share</span> → <span className="font-medium text-text-primary">Add to Home Screen</span>.
          </p>
        </Toast>
      )}

      {showOfflineReady && !needRefresh && (
        <Toast label="Ready offline" onClose={() => setShowOfflineReady(false)}>
          <p className="text-[14px] font-semibold text-text-primary">Climex is ready to work offline</p>
          <p className="text-[13px] text-text-secondary mt-0.5">Your last data will stay available without a connection.</p>
        </Toast>
      )}
    </div>
  );
}
