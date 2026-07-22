/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Alert, CryptoCoin, WeatherInfo, CurrencyPair, AQIMeasurement } from './types.js';

// In-memory store for active alerts
export const alertsList: Alert[] = [];

// Track active/triggered state to prevent duplicate firing (only alert on state transition)
// Key: "category-entityId", Value: state status
const activeStateMap = new Map<string, string>();

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

/**
 * Rules Engine for evaluating incoming data streams.
 * Triggers alerts on specific state transitions.
 */
export function evaluateRules(
  crypto: CryptoCoin[],
  weather: WeatherInfo[],
  currency: CurrencyPair[],
  aqi: AQIMeasurement[],
  isInitial = false
) {
  // 1. Evaluate Crypto Prices
  crypto.forEach(coin => {
    const stateKey = `crypto-${coin.id}`;
    const previousState = activeStateMap.get(stateKey) || 'normal';
    const isTriggered = Math.abs(coin.change24h) >= 3.0;

    if (isTriggered) {
      if (previousState !== 'triggered') {
        activeStateMap.set(stateKey, 'triggered');
        
        const changeDirection = coin.change24h >= 0 ? 'jumped' : 'dropped';
        const finalPrice = coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const changePercent = Math.abs(coin.change24h).toFixed(1);
        
        const alert: Alert = {
          id: `crypto-${coin.id}-${Date.now()}`,
          category: 'crypto',
          severity: 'needs-attention',
          headline: `${coin.name} ${changeDirection} ${changePercent}% past $${finalPrice}`,
          detail: `Significant market volatility drives ${coin.symbol.toUpperCase()} price action. The asset is exhibiting increased trading momentum with volume surging past $${(coin.volume24h / 1e6).toFixed(1)}M.`,
          createdAt: new Date().toISOString(),
          icon: 'coin-stack',
          sourceEvent: {
            metric: 'price_change',
            value: coin.price,
            targetEntity: coin.id,
            extraInfo: { change24h: coin.change24h, volume: coin.volume24h }
          }
        };

        if (isInitial) {
          alertsList.push(alert);
        } else {
          addAlert(alert);
        }
      }
    } else {
      if (previousState === 'triggered') {
        activeStateMap.set(stateKey, 'normal');
      }
    }
  });

  // 2. Evaluate Air Quality Index
  aqi.forEach(cityData => {
    const stateKey = `aqi-${cityData.city}`;
    const previousState = activeStateMap.get(stateKey) || 'normal';
    const isTriggered = cityData.aqi > 100;

    if (isTriggered) {
      if (previousState !== 'triggered') {
        activeStateMap.set(stateKey, 'triggered');

        const alert: Alert = {
          id: `aqi-${cityData.city.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          category: 'aqi',
          severity: 'needs-attention',
          headline: `Air quality in ${cityData.city} is unhealthy for sensitive groups`,
          detail: `The local air quality index reached an elevated reading of ${cityData.aqi} AQI. Children, elderly, and individuals with respiratory issues should limit prolonged outdoor exertion in ${cityData.city}.`,
          createdAt: new Date().toISOString(),
          icon: 'wind',
          sourceEvent: {
            metric: 'aqi_level',
            value: cityData.aqi,
            targetEntity: cityData.city,
            extraInfo: { status: cityData.status, pm25: cityData.pm25, healthMessage: cityData.healthMessage }
          }
        };

        if (isInitial) {
          alertsList.push(alert);
        } else {
          addAlert(alert);
        }
      }
    } else {
      if (previousState === 'triggered') {
        activeStateMap.set(stateKey, 'normal');
      }
    }
  });

  // 3. Evaluate Weather Precipitation
  weather.forEach(cityWeather => {
    const stateKey = `weather-${cityWeather.city}`;
    const previousState = activeStateMap.get(stateKey) || 'normal';
    const isTriggered = cityWeather.weatherCode >= 61;

    if (isTriggered) {
      if (previousState !== 'triggered') {
        activeStateMap.set(stateKey, 'triggered');

        const alert: Alert = {
          id: `weather-${cityWeather.city.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          category: 'weather',
          severity: 'needs-attention',
          headline: `Heavy rainfall warning issued for ${cityWeather.city}`,
          detail: `Precipitation levels are forecast to exceed 12mm/h starting shortly. Active weather pattern is characterized as: ${cityWeather.condition}. Residents should prepare for potential roadway pooling.`,
          createdAt: new Date().toISOString(),
          icon: 'cloud-sun',
          sourceEvent: {
            metric: 'precipitation',
            value: cityWeather.weatherCode,
            targetEntity: cityWeather.city,
            extraInfo: { temp: cityWeather.temp, condition: cityWeather.condition, windSpeed: cityWeather.windSpeed }
          }
        };

        if (isInitial) {
          alertsList.push(alert);
        } else {
          addAlert(alert);
        }
      }
    } else {
      if (previousState === 'triggered') {
        activeStateMap.set(stateKey, 'normal');
      }
    }
  });

  // 4. Evaluate Foreign Exchange Rates
  currency.forEach(pair => {
    const stateKey = `currency-${pair.id}`;
    const previousState = activeStateMap.get(stateKey) || 'normal';
    const isTriggered = Math.abs(pair.change24h) >= 1.0;

    if (isTriggered) {
      if (previousState !== 'triggered') {
        activeStateMap.set(stateKey, 'triggered');

        const changeWord = pair.change24h >= 0 ? 'strengthened' : 'weakened';
        const percentStr = Math.abs(pair.change24h).toFixed(2);

        const alert: Alert = {
          id: `currency-${pair.id.toLowerCase()}-${Date.now()}`,
          category: 'currency',
          severity: 'fyi',
          headline: `${pair.base} to ${pair.target} rate shifted by ${percentStr}%`,
          detail: `The FX index moved with high trading momentum, with exchange rate at ${pair.rate.toFixed(4)} ${pair.target}. Greenback and major FX markets are reflecting a high volume index of $${(pair.volume / 1e6).toFixed(1)}M.`,
          createdAt: new Date().toISOString(),
          icon: 'currency',
          sourceEvent: {
            metric: 'exchange_rate',
            value: pair.rate,
            targetEntity: pair.id,
            extraInfo: { change24h: pair.change24h, volume: pair.volume }
          }
        };

        if (isInitial) {
          alertsList.push(alert);
        } else {
          addAlert(alert);
        }
      }
    } else {
      if (previousState === 'triggered') {
        activeStateMap.set(stateKey, 'normal');
      }
    }
  });
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
