/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Climex service worker (vite-plugin-pwa, injectManifest).
 * - Precaches the app shell (HTML, JS, CSS, icons, offline page).
 * - Runtime-caches each data type with its own strategy, cache name, size and age limits.
 * - Never caches non-GET requests or URLs that carry credentials.
 * - Waits for the page to send SKIP_WAITING before activating an update.
 */

import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import * as navigationPreload from 'workbox-navigation-preload';
import { clientsClaim } from 'workbox-core';

// The project compiles with the DOM lib only, so the worker scope is typed loosely here.
const sw = self as any;

// Bump to invalidate every runtime cache on the next activation.
const CACHE_VERSION = 'v1';
const CACHES = {
  crypto: `climex-crypto-${CACHE_VERSION}`,
  currency: `climex-currency-${CACHE_VERSION}`,
  weather: `climex-weather-${CACHE_VERSION}`,
  aqi: `climex-aqi-${CACHE_VERSION}`,
  countries: `climex-countries-${CACHE_VERSION}`,
  alerts: `climex-alerts-${CACHE_VERSION}`,
  summary: `climex-summary-${CACHE_VERSION}`,
  images: `climex-images-${CACHE_VERSION}`,
  fonts: `climex-fonts-${CACHE_VERSION}`,
  pages: `climex-pages-${CACHE_VERSION}`,
};
const MINUTE = 60;
const DAY = 24 * 60 * MINUTE;

precacheAndRoute((self as any).__WB_MANIFEST);
cleanupOutdatedCaches();
navigationPreload.enable();
clientsClaim();

// ---------- guards ----------
const SECRET_PARAM = /[?&](api[_-]?key|apikey|key|token|access_token|appid|secret|signature)=/i;
const isSafeGet = (url: URL, request: Request) => request.method === 'GET' && !SECRET_PARAM.test(url.search);
const sameOrigin = (url: URL) => url.origin === sw.location.origin;
const apiRoute = (path: string) => ({ url, request }: { url: URL; request: Request }) =>
  sameOrigin(url) && url.pathname === path && isSafeGet(url, request);

const ok200 = () => new CacheableResponsePlugin({ statuses: [200] });
// Opaque (status 0) responses are only accepted for cross-origin CDN assets
const okOpaque = () => new CacheableResponsePlugin({ statuses: [0, 200] });
const limit = (maxEntries: number, maxAgeSeconds: number) => new ExpirationPlugin({ maxEntries, maxAgeSeconds, purgeOnQuotaError: true });

// ---------- data (same-origin API proxy; third-party keys never reach the browser) ----------
registerRoute(apiRoute('/api/crypto'), new NetworkFirst({ cacheName: CACHES.crypto, networkTimeoutSeconds: 4, plugins: [ok200(), limit(4, 2 * MINUTE)] }));
registerRoute(apiRoute('/api/currency'), new StaleWhileRevalidate({ cacheName: CACHES.currency, plugins: [ok200(), limit(4, 60 * MINUTE)] }));
registerRoute(apiRoute('/api/weather'), new StaleWhileRevalidate({ cacheName: CACHES.weather, plugins: [ok200(), limit(4, 15 * MINUTE)] }));
registerRoute(apiRoute('/api/air-quality'), new StaleWhileRevalidate({ cacheName: CACHES.aqi, plugins: [ok200(), limit(4, 30 * MINUTE)] }));
registerRoute(apiRoute('/api/countries'), new CacheFirst({ cacheName: CACHES.countries, plugins: [ok200(), limit(4, 30 * DAY)] }));
// Not in the data table but needed offline: the alerts feed and the landing page's summary
registerRoute(apiRoute('/api/alerts'), new NetworkFirst({ cacheName: CACHES.alerts, networkTimeoutSeconds: 4, plugins: [ok200(), limit(4, DAY)] }));
registerRoute(apiRoute('/api/dashboard'), new NetworkFirst({ cacheName: CACHES.summary, networkTimeoutSeconds: 4, plugins: [ok200(), limit(2, 15 * MINUTE)] }));

// ---------- static assets ----------
// Flags, coin logos and the world map outline from public CDNs
registerRoute(
  ({ url, request }) =>
    isSafeGet(url, request) &&
    (url.hostname === 'flagcdn.com' ||
      url.hostname === 'assets.coincap.io' ||
      (url.hostname === 'cdn.jsdelivr.net' && (url.pathname.includes('/cryptocurrency-icons') || url.pathname.includes('/world-atlas')))),
  new CacheFirst({ cacheName: CACHES.images, plugins: [okOpaque(), limit(300, 30 * DAY)] })
);
// Same-origin images that aren't precached (banners, screenshots)
registerRoute(
  ({ url, request }) => sameOrigin(url) && request.destination === 'image' && isSafeGet(url, request),
  new CacheFirst({ cacheName: CACHES.images, plugins: [ok200(), limit(60, 30 * DAY)] })
);
// Google Fonts stylesheets and font files
registerRoute(
  ({ url, request }) => isSafeGet(url, request) && (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'),
  new CacheFirst({ cacheName: CACHES.fonts, plugins: [okOpaque(), limit(30, 365 * DAY)] })
);

// ---------- navigations ----------
// App routes: network first (uses the navigation preload response), cached copy when offline.
const APP_ROUTES = /^\/(dashboard|updates|crypto|currency|weather|air-quality|countries|reports|settings|privacy|privacy-policy|admin)?\/?$/;
registerRoute(
  new NavigationRoute(new NetworkFirst({ cacheName: CACHES.pages, networkTimeoutSeconds: 3, plugins: [ok200(), limit(20, 7 * DAY)] }), {
    denylist: [/^\/api\//, /^\/ws/],
  })
);

// When a request fails: app routes get the cached app shell (it renders the last saved data);
// any other page gets the offline page.
setCatchHandler(async ({ request, url }: { request: Request; url: URL }) => {
  if (request.destination === 'document') {
    if (APP_ROUTES.test(url.pathname)) {
      return (await matchPrecache('/index.html')) ?? (await matchPrecache('/offline.html')) ?? Response.error();
    }
    return (await matchPrecache('/offline.html')) ?? Response.error();
  }
  return Response.error();
});

// ---------- lifecycle ----------
sw.addEventListener('message', (event: any) => {
  if (event.data?.type === 'SKIP_WAITING') sw.skipWaiting();
});

sw.addEventListener('activate', (event: any) => {
  const current = new Set(Object.values(CACHES));
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('climex-') && !current.has(k)).map(k => caches.delete(k)))
    )
  );
});

// ---------- optional features (inert unless the page enables them) ----------
// Periodic Background Sync: refresh the data caches (Chromium only; registered by the page behind a flag)
const REFRESH_URLS: Array<[string, string]> = [
  ['/api/crypto', CACHES.crypto],
  ['/api/currency', CACHES.currency],
  ['/api/weather', CACHES.weather],
  ['/api/air-quality', CACHES.aqi],
  ['/api/alerts', CACHES.alerts],
];
sw.addEventListener('periodicsync', (event: any) => {
  if (event.tag !== 'climex-refresh') return;
  event.waitUntil(
    Promise.all(
      REFRESH_URLS.map(async ([path, cacheName]) => {
        const res = await fetch(path, { cache: 'no-store' });
        if (res.ok) await (await caches.open(cacheName)).put(path, res);
      })
    ).catch(() => undefined)
  );
});

// Web Push for crypto price alerts (only reachable after the user opts in from the page)
sw.addEventListener('push', (event: any) => {
  let payload: { title?: string; body?: string; url?: string; count?: number } = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }
  const title = payload.title || 'Climex price alert';
  event.waitUntil(
    Promise.all([
      sw.registration.showNotification(title, {
        body: payload.body || 'A tracked coin moved past your alert threshold.',
        icon: '/icons/pwa-192x192.png',
        badge: '/icons/pwa-96x96.png',
        data: { url: payload.url || '/updates' },
        tag: 'climex-price-alert',
      }),
      typeof payload.count === 'number' && 'setAppBadge' in navigator ? (navigator as any).setAppBadge(payload.count) : undefined,
    ])
  );
});

sw.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const target = event.notification.data?.url || '/updates';
  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows: any[]) => {
      const existing = windows.find(w => new URL(w.url).origin === sw.location.origin);
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return sw.clients.openWindow(target);
    })
  );
});
