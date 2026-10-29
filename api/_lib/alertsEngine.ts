/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Alert, CryptoCoin, WeatherInfo, CurrencyPair, AQIMeasurement } from './types.js';

// In-memory store for active alerts
export const alertsList: Alert[] = [];

// Alerts are released as an hourly digest: each category posts at most once per window,
// and an individual coin / city / pair is reported at most once per window.
export const ALERT_INTERVAL_MS = 60 * 60 * 1000;

type Category = Alert['category'];

interface Candidate {
  alert: Alert;
  label: string; // short line used when several candidates are combined, e.g. "Monero −3.1%"
  weight: number; // sort key: biggest move / worst reading first
}

// Track active/triggered state so an entity only queues on a state transition
// Key: "category-entityId", Value: state status
const activeStateMap = new Map<string, string>();
// Last time each entity was included in a released alert
const entityLastAlertAt = new Map<string, number>();
// Last time each category released an alert
const categoryLastAlertAt = new Map<Category, number>();
// Triggered entities waiting for their category's next release
const pending = new Map<Category, Map<string, Candidate>>();

// WebSocket broadcast callback register
let broadcastCallback: ((alert: Alert) => void) | null = null;

export function registerBroadcastCallback(cb: (alert: Alert) => void) {
  broadcastCallback = cb;
}

// Helper to add and broadcast an alert
export function addAlert(alert: Alert) {
  // Prepend to top of list
  alertsList.unshift(alert);

  // Limit memory storage to 50 alerts
  if (alertsList.length > 50) {
    alertsList.pop();
  }

  // Trigger real-time broadcast
  if (broadcastCallback) {
    try {
      broadcastCallback(alert);
    } catch (err) {
      console.error('Error broadcasting alert:', err);
    }
  }
}

function queue(category: Category, stateKey: string, candidate: Candidate, now: number) {
  const last = entityLastAlertAt.get(stateKey);
  if (last !== undefined && now - last < ALERT_INTERVAL_MS) return;
  if (!pending.has(category)) pending.set(category, new Map());
  pending.get(category)!.set(stateKey, candidate);
}

const SUMMARY_COPY: Record<Category, { icon: string; severity: Alert['severity']; headline: (n: number) => string; lead: string }> = {
  crypto: {
    icon: 'coin-stack',
    severity: 'needs-attention',
    headline: n => `${n} coins moved more than 3% in the past hour`,
    lead: 'Biggest moves',
  },
  aqi: {
    icon: 'wind',
    severity: 'needs-attention',
    headline: n => `Air quality is unhealthy for sensitive groups in ${n} cities`,
    lead: 'Highest readings',
  },
  weather: {
    icon: 'cloud-sun',
    severity: 'needs-attention',
    headline: n => `Heavy rain expected in ${n} cities`,
    lead: 'Affected cities',
  },
  currency: {
    icon: 'currency',
    severity: 'fyi',
    headline: n => `${n} currency pairs moved more than 1%`,
    lead: 'Largest shifts',
  },
};

/** Release one alert per category whose window has passed: the single candidate, or a combined summary. */
function flush(now: number, isInitial: boolean) {
  pending.forEach((items, category) => {
    if (items.size === 0) return;
    const last = categoryLastAlertAt.get(category);
    if (!isInitial && last !== undefined && now - last < ALERT_INTERVAL_MS) return;

    const candidates = [...items.values()].sort((a, b) => b.weight - a.weight);
    let alert: Alert;
    if (candidates.length === 1) {
      alert = candidates[0].alert;
    } else {
      const copy = SUMMARY_COPY[category];
      const top = candidates.slice(0, 5).map(c => c.label);
      const more = candidates.length - top.length;
      alert = {
        id: `${category}-digest-${now}`,
        category,
        severity: copy.severity,
        headline: copy.headline(candidates.length),
        detail: `${copy.lead}: ${top.join(', ')}${more > 0 ? `, and ${more} more` : ''}.`,
        createdAt: new Date(now).toISOString(),
        icon: copy.icon,
        sourceEvent: {
          metric: candidates[0].alert.sourceEvent.metric,
          value: candidates.length,
          targetEntity: candidates.map(c => c.alert.sourceEvent.targetEntity).join(', '),
          extraInfo: { items: candidates.length, window: '1 hour' },
        },
      };
    }

    items.forEach((_c, stateKey) => entityLastAlertAt.set(stateKey, now));
    items.clear();
    categoryLastAlertAt.set(category, now);

    if (isInitial) {
      alertsList.push(alert);
    } else {
      addAlert(alert);
    }
  });
}

/** Marks an entity triggered/normal; returns true only on the transition into "triggered". */
function transition(stateKey: string, isTriggered: boolean): boolean {
  const previousState = activeStateMap.get(stateKey) || 'normal';
  if (isTriggered) {
    if (previousState !== 'triggered') {
      activeStateMap.set(stateKey, 'triggered');
      return true;
    }
  } else if (previousState === 'triggered') {
    activeStateMap.set(stateKey, 'normal');
    // Recovered before its category's next release: don't report it
    pending.forEach(items => items.delete(stateKey));
  }
  return false;
}

/**
 * Rules Engine for evaluating incoming data streams.
 * Entities that cross a threshold are queued, then released as at most one alert per category per hour.
 */
export function evaluateRules(
  crypto: CryptoCoin[],
  weather: WeatherInfo[],
  currency: CurrencyPair[],
  aqi: AQIMeasurement[],
  isInitial = false
) {
  const now = Date.now();
  const createdAt = new Date(now).toISOString();

  // 1. Evaluate Crypto Prices
  crypto.forEach(coin => {
    const stateKey = `crypto-${coin.id}`;
    if (!transition(stateKey, Math.abs(coin.change24h) >= 3.0)) return;

    const changeDirection = coin.change24h >= 0 ? 'jumped' : 'dropped';
    const finalPrice = coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const changePercent = Math.abs(coin.change24h).toFixed(1);

    queue('crypto', stateKey, {
      label: `${coin.name} ${coin.change24h >= 0 ? '+' : '−'}${changePercent}%`,
      weight: Math.abs(coin.change24h),
      alert: {
        id: `crypto-${coin.id}-${now}`,
        category: 'crypto',
        severity: 'needs-attention',
        headline: `${coin.name} ${changeDirection} ${changePercent}% past $${finalPrice}`,
        detail: `Significant market volatility drives ${coin.symbol.toUpperCase()} price action. The asset is exhibiting increased trading momentum with volume surging past $${(coin.volume24h / 1e6).toFixed(1)}M.`,
        createdAt,
        icon: 'coin-stack',
        sourceEvent: {
          metric: 'price_change',
          value: coin.price,
          targetEntity: coin.id,
          extraInfo: { change24h: coin.change24h, volume: coin.volume24h }
        }
      }
    }, now);
  });

  // 2. Evaluate Air Quality Index
  aqi.forEach(cityData => {
    const stateKey = `aqi-${cityData.city}`;
    if (!transition(stateKey, cityData.aqi > 100)) return;

    queue('aqi', stateKey, {
      label: `${cityData.city} ${cityData.aqi} AQI`,
      weight: cityData.aqi,
      alert: {
        id: `aqi-${cityData.city.replace(/\s+/g, '-').toLowerCase()}-${now}`,
        category: 'aqi',
        severity: 'needs-attention',
        headline: `Air quality in ${cityData.city} is unhealthy for sensitive groups`,
        detail: `The local air quality index reached an elevated reading of ${cityData.aqi} AQI. Children, elderly, and individuals with respiratory issues should limit prolonged outdoor exertion in ${cityData.city}.`,
        createdAt,
        icon: 'wind',
        sourceEvent: {
          metric: 'aqi_level',
          value: cityData.aqi,
          targetEntity: cityData.city,
          extraInfo: { status: cityData.status, pm25: cityData.pm25, healthMessage: cityData.healthMessage }
        }
      }
    }, now);
  });

  // 3. Evaluate Weather Precipitation
  weather.forEach(cityWeather => {
    const stateKey = `weather-${cityWeather.city}`;
    if (!transition(stateKey, cityWeather.weatherCode >= 61)) return;

    queue('weather', stateKey, {
      label: `${cityWeather.city} (${cityWeather.condition})`,
      weight: cityWeather.weatherCode,
      alert: {
        id: `weather-${cityWeather.city.replace(/\s+/g, '-').toLowerCase()}-${now}`,
        category: 'weather',
        severity: 'needs-attention',
        headline: `Heavy rainfall warning issued for ${cityWeather.city}`,
        detail: `Precipitation levels are forecast to exceed 12mm/h starting shortly. Active weather pattern is characterized as: ${cityWeather.condition}. Residents should prepare for potential roadway pooling.`,
        createdAt,
        icon: 'cloud-sun',
        sourceEvent: {
          metric: 'precipitation',
          value: cityWeather.weatherCode,
          targetEntity: cityWeather.city,
          extraInfo: { temp: cityWeather.temp, condition: cityWeather.condition, windSpeed: cityWeather.windSpeed }
        }
      }
    }, now);
  });

  // 4. Evaluate Foreign Exchange Rates
  currency.forEach(pair => {
    const stateKey = `currency-${pair.id}`;
    if (!transition(stateKey, Math.abs(pair.change24h) >= 1.0)) return;

    const changeWord = pair.change24h >= 0 ? 'strengthened' : 'weakened';
    const percentStr = Math.abs(pair.change24h).toFixed(2);

    queue('currency', stateKey, {
      label: `${pair.base}/${pair.target} ${pair.change24h >= 0 ? '+' : '−'}${percentStr}%`,
      weight: Math.abs(pair.change24h),
      alert: {
        id: `currency-${pair.id.toLowerCase()}-${now}`,
        category: 'currency',
        severity: 'fyi',
        headline: `${pair.base} to ${pair.target} rate shifted by ${percentStr}%`,
        detail: `The ${pair.base} ${changeWord} against the ${pair.target}, with the exchange rate at ${pair.rate.toFixed(4)} ${pair.target} on a volume index of $${(pair.volume / 1e6).toFixed(1)}M.`,
        createdAt,
        icon: 'currency',
        sourceEvent: {
          metric: 'exchange_rate',
          value: pair.rate,
          targetEntity: pair.id,
          extraInfo: { change24h: pair.change24h, volume: pair.volume }
        }
      }
    }, now);
  });

  flush(now, isInitial);
}

/**
 * Seed initial alerts list to guarantee valid, data-driven initial state
 */
export async function seedInitialAlerts(
  getCrypto: () => Promise<any>,
  getWeather: () => Promise<any>,
  getCurrency: () => Promise<any>,
  getAQI: () => Promise<any>
) {
  try {
    const [crypto, weather, currency, aqi] = await Promise.all([
      getCrypto(),
      getWeather(),
      getCurrency(),
      getAQI()
    ]);

    evaluateRules(crypto.data, weather.data, currency.data, aqi.data, true);

    if (alertsList.length === 0) {
      alertsList.push(
        {
          id: 'crypto-bitcoin-init',
          category: 'crypto',
          severity: 'needs-attention',
          headline: 'Bitcoin jumped 3.4% past $92,450',
          detail: 'Bullish momentum drives BTC to a new local high with trading volume surging over 140%.',
          createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          icon: 'coin-stack',
          sourceEvent: { metric: 'price_change', value: 92450.25, targetEntity: 'bitcoin' }
        },
        {
          id: 'aqi-london-init',
          category: 'aqi',
          severity: 'needs-attention',
          headline: 'Air quality in London is unhealthy for sensitive groups',
          detail: 'The local index reached 131 AQI. Children and elderly should limit outdoor exertion.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: 'wind',
          sourceEvent: { metric: 'aqi_level', value: 131, targetEntity: 'London' }
        },
        {
          id: 'weather-tokyo-init',
          category: 'weather',
          severity: 'needs-attention',
          headline: 'Heavy rainfall warning issued for Tokyo',
          detail: 'Precipitation is expected to exceed 12mm/h starting at 18:00 UTC.',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          icon: 'cloud-sun',
          sourceEvent: { metric: 'precipitation', value: 61, targetEntity: 'Tokyo' }
        },
        {
          id: 'currency-usd-eur-init',
          category: 'currency',
          severity: 'fyi',
          headline: 'US dollar strengthened by 1.2% against the euro',
          detail: 'The exchange index rose to 0.941 EUR, reflecting strong greenback strength.',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icon: 'currency',
          sourceEvent: { metric: 'exchange_rate', value: 0.941, targetEntity: 'USD_EUR' }
        }
      );
    }
  } catch (err) {
    console.error('Failed to seed initial alerts:', err);
  }
}
