/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CryptoCoin, WeatherDay, WeatherInfo, CurrencyPair, AQIMeasurement, CountryStat, DataSyncStatus } from '../types';

export const MONITORED_CITIES = [
  { city: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York', code: 'US' },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', code: 'GB' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917, timezone: 'Asia/Tokyo', code: 'JP' },
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris', code: 'FR' },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin', code: 'DE' },
  { city: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, timezone: 'Asia/Manila', code: 'PH' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney', code: 'AU' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto', code: 'CA' },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, timezone: 'America/Sao_Paulo', code: 'BR' },
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, timezone: 'Africa/Johannesburg', code: 'ZA' },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata', code: 'IN' },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore', code: 'SG' },
  { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai', code: 'AE' },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, timezone: 'America/Mexico_City', code: 'MX' },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul', code: 'KR' },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid', code: 'ES' },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome', code: 'IT' },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, timezone: 'Europe/Amsterdam', code: 'NL' },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, timezone: 'Europe/Zurich', code: 'CH' },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, timezone: 'Europe/Stockholm', code: 'SE' },
  { city: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, timezone: 'Europe/Oslo', code: 'NO' },
  { city: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762, timezone: 'Pacific/Auckland', code: 'NZ' },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, timezone: 'America/Argentina/Buenos_Aires', code: 'AR' },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo', code: 'EG' },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul', code: 'TR' },
  { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, timezone: 'Asia/Riyadh', code: 'SA' },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, timezone: 'Asia/Ho_Chi_Minh', code: 'VN' },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, timezone: 'Asia/Bangkok', code: 'TH' }
];

export const COINGECKO_COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', tags: ['Layer 1', 'Store of Value', 'POW'] },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', tags: ['Layer 1', 'Smart Contracts', 'POS'] },
  { id: 'solana', name: 'Solana', symbol: 'sol', tags: ['Layer 1', 'High Speed', 'DeFi'] },
  { id: 'cardano', name: 'Cardano', symbol: 'ada', tags: ['Layer 1', 'Research', 'POS'] },
  { id: 'ripple', name: 'Ripple', symbol: 'xrp', tags: ['Payments', 'Enterprise', 'Fast'] },
  { id: 'bnb', name: 'BNB', symbol: 'bnb', tags: ['Exchange Token', 'BSC', 'POS'] },
  { id: 'dot', name: 'Polkadot', symbol: 'dot', tags: ['Layer 1', 'Multichain', 'POS'] },
  { id: 'doge', name: 'Dogecoin', symbol: 'doge', tags: ['Meme Coin', 'POW', 'Community'] },
  { id: 'avax', name: 'Avalanche', symbol: 'avax', tags: ['Layer 1', 'EVM', 'POS'] },
  { id: 'link', name: 'Chainlink', symbol: 'link', tags: ['Oracles', 'Data', 'DeFi'] },
  { id: 'matic', name: 'Polygon', symbol: 'matic', tags: ['Layer 2', 'Scaling', 'EVM'] },
  { id: 'shib', name: 'Shiba Inu', symbol: 'shib', tags: ['Meme Coin', 'ERC20', 'Community'] },
  { id: 'atom', name: 'Cosmos', symbol: 'atom', tags: ['Layer 1', 'Interoperable', 'POS'] },
  { id: 'uni', name: 'Uniswap', symbol: 'uni', tags: ['DeFi', 'DEX', 'Governance'] },
  { id: 'litecoin', name: 'Litecoin', symbol: 'ltc', tags: ['Payments', 'POW', 'Silver'] },
  { id: 'stellar', name: 'Stellar', symbol: 'xlm', tags: ['Payments', 'Enterprise', 'Fast'] },
  { id: 'monero', name: 'Monero', symbol: 'xmr', tags: ['Privacy', 'Anonymity', 'POW'] },
  { id: 'ethereum-classic', name: 'Ethereum Classic', symbol: 'etc', tags: ['Layer 1', 'POW', 'Contracts'] },
  { id: 'the-open-network', name: 'Toncoin', symbol: 'ton', tags: ['Layer 1', 'Telegram', 'POS'] },
  { id: 'near', name: 'NEAR Protocol', symbol: 'near', tags: ['Layer 1', 'AI', 'POS'] },
  { id: 'sui', name: 'Sui', symbol: 'sui', tags: ['Layer 1', 'Move Language', 'POS'] },
  { id: 'aptos', name: 'Aptos', symbol: 'apt', tags: ['Layer 1', 'Move Language', 'POS'] },
  { id: 'optimism', name: 'Optimism', symbol: 'op', tags: ['Layer 2', 'Rollup', 'EVM'] },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'arb', tags: ['Layer 2', 'Rollup', 'EVM'] },
  { id: 'render-token', name: 'Render', symbol: 'render', tags: ['AI', 'GPU', 'DePIN'] },
  { id: 'hedera-hashgraph', name: 'Hedera', symbol: 'hbar', tags: ['Enterprise', 'Hashgraph', 'Fast'] },
  { id: 'fantom', name: 'Fantom', symbol: 'ftm', tags: ['Layer 1', 'DeFi', 'Fast'] }
];

export const CURRENCY_PAIRS = [
  { id: 'USD_EUR', base: 'USD', target: 'EUR', volume: 450000000 },
  { id: 'USD_JPY', base: 'USD', target: 'JPY', volume: 320000000 },
  { id: 'USD_GBP', base: 'USD', target: 'GBP', volume: 210000000 },
  { id: 'USD_PHP', base: 'USD', target: 'PHP', volume: 45000000 },
  { id: 'USD_CAD', base: 'USD', target: 'CAD', volume: 110000000 },
  { id: 'USD_AUD', base: 'USD', target: 'AUD', volume: 150000000 },
  { id: 'USD_SGD', base: 'USD', target: 'SGD', volume: 75000000 },
  { id: 'USD_INR', base: 'USD', target: 'INR', volume: 95000000 },
  { id: 'USD_CHF', base: 'USD', target: 'CHF', volume: 140000000 },
  { id: 'USD_MXN', base: 'USD', target: 'MXN', volume: 60000000 },
  { id: 'USD_BRL', base: 'USD', target: 'BRL', volume: 50000000 },
  { id: 'USD_ZAR', base: 'USD', target: 'ZAR', volume: 35000000 },
  { id: 'USD_CNY', base: 'USD', target: 'CNY', volume: 280000000 },
  { id: 'USD_NZD', base: 'USD', target: 'NZD', volume: 85000000 },
  { id: 'USD_KRW', base: 'USD', target: 'KRW', volume: 190000000 },
  { id: 'USD_SEK', base: 'USD', target: 'SEK', volume: 65000000 },
  { id: 'USD_NOK', base: 'USD', target: 'NOK', volume: 55000000 },
  { id: 'USD_DKK', base: 'USD', target: 'DKK', volume: 48000000 },
  { id: 'USD_HKD', base: 'USD', target: 'HKD', volume: 120000000 },
  { id: 'USD_MYR', base: 'USD', target: 'MYR', volume: 38000000 },
  { id: 'USD_THB', base: 'USD', target: 'THB', volume: 42000000 },
  { id: 'USD_IDR', base: 'USD', target: 'IDR', volume: 50000000 },
  { id: 'USD_TRY', base: 'USD', target: 'TRY', volume: 33000000 },
  { id: 'USD_RUB', base: 'USD', target: 'RUB', volume: 25000000 },
  { id: 'USD_ILS', base: 'USD', target: 'ILS', volume: 31000000 }
];

// Weather interpretation codes based on WMO
export function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
}

// AQI calculations
export function getAQIStatus(aqi: number): 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAQILevelDetails(aqi: number) {
  if (aqi <= 50) {
    return {
      status: 'Good' as const,
      color: '#10b981', // emerald
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      healthMessage: 'Good — Air quality is satisfactory, and air pollution poses little or no risk.',
      mainPollutant: 'O3'
    };
  } else if (aqi <= 100) {
    return {
      status: 'Moderate' as const,
      color: '#eab308', // amber/yellow
      bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      healthMessage: 'Moderate — Sensitive groups should limit prolonged outdoor exertion.',
      mainPollutant: 'PM2.5'
    };
  } else if (aqi <= 150) {
    return {
      status: 'Unhealthy for Sensitive Groups' as const,
      color: '#f97316', // orange
      bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      healthMessage: 'Unhealthy for Sensitive Groups — Sensitive groups may experience health effects. General public not likely affected.',
      mainPollutant: 'PM2.5'
    };
  } else if (aqi <= 200) {
    return {
      status: 'Unhealthy' as const,
      color: '#ef4444', // red
      bgClass: 'bg-red-500/10 text-red-400 border-red-500/20',
      healthMessage: 'Unhealthy — Everyone may begin to experience health effects; sensitive groups may experience more serious health effects.',
      mainPollutant: 'PM2.5'
    };
  } else if (aqi <= 300) {
    return {
      status: 'Very Unhealthy' as const,
      color: '#a855f7', // purple
      bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      healthMessage: 'Very Unhealthy — Health alert: everyone may experience more serious health effects.',
      mainPollutant: 'PM2.5'
    };
  } else {
    return {
      status: 'Hazardous' as const,
      color: '#991b1b', // maroon
      bgClass: 'bg-red-950/25 text-red-500 border-red-900/30',
      healthMessage: 'Hazardous — Health warning of emergency conditions: everyone is more likely to be affected.',
      mainPollutant: 'PM2.5'
    };
  }
}

// ----------------------------------------------------
// HIGH-FIDELITY DEFAULT/FALLBACK DATASETS
// These are generated dynamically relative to current timestamp
// to ensure stats look perfectly live and realistic at any run.
// ----------------------------------------------------

export function generateMockCrypto(timeSeed: number): CryptoCoin[] {
  const basePrices: Record<string, { price: number; change: number; cap: number; vol: number }> = {
    bitcoin: { price: 92450.25, change: 3.42, cap: 1820000000000, vol: 28400000000 },
    ethereum: { price: 3420.80, change: -1.24, cap: 412000000000, vol: 15200000000 },
    solana: { price: 184.50, change: 8.75, cap: 86000000000, vol: 3900000000 },
    cardano: { price: 0.52, change: 0.45, cap: 18500000000, vol: 320000000 },
    ripple: { price: 1.12, change: -2.31, cap: 64000000000, vol: 1400000000 },
    bnb: { price: 580.40, change: 1.15, cap: 88000000000, vol: 1100000000 },
    dot: { price: 5.85, change: -0.92, cap: 8500000000, vol: 180000000 },
    doge: { price: 0.38, change: 12.45, cap: 55000000000, vol: 4800000000 },
    avax: { price: 28.90, change: -2.14, cap: 11800000000, vol: 310000000 },
    link: { price: 14.20, change: 0.75, cap: 8900000000, vol: 240000000 },
    matic: { price: 0.44, change: -3.50, cap: 4300000000, vol: 150000000 },
    shib: { price: 0.000022, change: 4.80, cap: 13000000000, vol: 850000000 },
    atom: { price: 6.12, change: -1.05, cap: 2400000000, vol: 90000000 },
    uni: { price: 9.75, change: 2.10, cap: 5800000000, vol: 210000000 },
    litecoin: { price: 85.50, change: 1.40, cap: 6400000000, vol: 450000000 },
    stellar: { price: 0.15, change: -0.85, cap: 4500000000, vol: 120000000 },
    monero: { price: 165.20, change: 0.22, cap: 3000000000, vol: 80000000 },
    'ethereum-classic': { price: 24.80, change: -1.10, cap: 3600000000, vol: 210000000 },
    'the-open-network': { price: 7.25, change: 5.40, cap: 18000000000, vol: 420000000 },
    near: { price: 5.40, change: 4.12, cap: 5800000000, vol: 310000000 },
    sui: { price: 1.95, change: 9.20, cap: 5400000000, vol: 480000000 },
    aptos: { price: 8.15, change: 3.50, cap: 4100000000, vol: 260000000 },
    optimism: { price: 2.10, change: -1.85, cap: 2300000000, vol: 150000000 },
    arbitrum: { price: 0.85, change: -2.40, cap: 2500000000, vol: 180000000 },
    'render-token': { price: 7.80, change: 11.20, cap: 3100000000, vol: 350000000 },
    'hedera-hashgraph': { price: 0.065, change: 0.15, cap: 2300000000, vol: 75000000 },
    fantom: { price: 0.78, change: 6.30, cap: 2200000000, vol: 140000000 }
  };

  const unsorted = COINGECKO_COINS.map((coin, index) => {
    const base = basePrices[coin.id] || { price: 1.0, change: 0, cap: 10000000, vol: 500000 };
    // Introduce light random variations based on timeSeed
    const priceVar = Math.sin(timeSeed + index) * (base.price * 0.005);
    const finalPrice = base.price + priceVar;
    const finalChange = base.change + Math.cos(timeSeed + index) * 0.2;

    // Generate sparkline values
    const sparkline: number[] = [];
    for (let i = 0; i < 24; i++) {
      sparkline.push(finalPrice * (1 + Math.sin(timeSeed + i * 0.5 + index) * 0.02));
    }

    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: finalPrice,
      change24h: finalChange,
      marketCap: base.cap,
      volume24h: base.vol,
      rank: index + 1,
      sparkline,
      tags: coin.tags
    };
  });

  return [...unsorted]
    .sort((a, b) => b.marketCap - a.marketCap)
    .map((coin, index) => ({
      ...coin,
      rank: index + 1
    }));
}

export function generateMockWeather(timeSeed: number): WeatherInfo[] {
  return MONITORED_CITIES.map((item, index) => {
    const baseTemp = 15 + Math.sin(timeSeed + index) * 10;
    const humidity = Math.floor(50 + Math.sin(timeSeed * 0.5 + index) * 30);
    const windSpeed = Math.floor(8 + Math.cos(timeSeed + index) * 12);
    const weatherCode = [0, 1, 3, 61, 80, 95][Math.floor((Math.sin(timeSeed + index) + 1) * 3)] || 1;
    const condition = getWeatherCondition(weatherCode);

    // 7-day forecast
    const forecast: WeatherDay[] = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const forecastTempMax = baseTemp + 2 + Math.sin(timeSeed + index + i) * 3;
      const forecastTempMin = baseTemp - 5 + Math.sin(timeSeed + index + i) * 3;
      const dayCode = [0, 1, 3, 61][Math.floor((Math.sin(timeSeed + index + i) + 1) * 2)] || 1;
      const dayName = daysOfWeek[(new Date().getDay() + i) % 7];
      forecast.push({
        date: dayName,
        tempMax: Number(forecastTempMax.toFixed(1)),
        tempMin: Number(forecastTempMin.toFixed(1)),
        weatherCode: dayCode,
        condition: getWeatherCondition(dayCode),
        alert: i === 2 && dayCode === 61 ? 'Heavy Rainfall Warning' : undefined
      });
    }

    return {
      city: item.city,
      country: item.country,
      temp: Number(baseTemp.toFixed(1)),
      feelsLike: Number((baseTemp + (humidity > 70 ? 2 : -1)).toFixed(1)),
      weatherCode,
      condition,
      humidity,
      windSpeed,
      rainfallDays: Math.floor(8 + Math.sin(timeSeed * 0.2 + index) * 5),
      volatilityDays: Math.floor(4 + Math.cos(timeSeed * 0.3 + index) * 3),
      lat: item.lat,
      lon: item.lon,
      timezone: item.timezone,
      forecast
    };
  });
}

export function generateMockCurrency(timeSeed: number): CurrencyPair[] {
  const baseRates: Record<string, number> = {
    USD_EUR: 0.92,
    USD_JPY: 154.50,
    USD_GBP: 0.79,
    USD_PHP: 57.80,
    USD_CAD: 1.36,
    USD_AUD: 1.51,
    USD_SGD: 1.34,
    USD_INR: 83.50,
    USD_CHF: 0.90,
    USD_MXN: 18.20,
    USD_BRL: 5.45,
    USD_ZAR: 18.10,
    USD_CNY: 7.25,
    USD_NZD: 1.65,
    USD_KRW: 1380.00,
    USD_SEK: 10.60,
    USD_NOK: 10.80,
    USD_DKK: 6.85,
    USD_HKD: 7.80,
    USD_MYR: 4.70,
    USD_THB: 36.20,
    USD_IDR: 16200.00,
    USD_TRY: 33.10,
    USD_RUB: 88.50,
    USD_ILS: 3.65
  };

  return CURRENCY_PAIRS.map((pair, index) => {
    const baseRate = baseRates[pair.id] || 1.0;
    const rateVar = Math.sin(timeSeed + index) * (baseRate * 0.003);
    const finalRate = baseRate + rateVar;
    const change24h = Math.sin(timeSeed * 1.5 + index) * 0.8;

    // Generate history
    const history: { date: string; rate: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const histDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      history.push({
        date: histDate,
        rate: baseRate * (1 + Math.sin(timeSeed * 0.2 + i * 0.4 + index) * 0.01)
      });
    }

    return {
      id: pair.id,
      base: pair.base,
      target: pair.target,
      rate: finalRate,
      change24h,
      volatility: Math.floor(30 + Math.abs(Math.sin(timeSeed + index) * 50)),
      volume: pair.volume,
      history
    };
  });
}

export function generateMockAQI(timeSeed: number): AQIMeasurement[] {
  return MONITORED_CITIES.map((item, index) => {
    // Standard AQI ranging from 15 to 165
    const baseAQI = Math.floor(35 + Math.sin(timeSeed * 0.7 + index) * 60 + (item.city === 'Tokyo' || item.city === 'Manila' ? 40 : 0));
    const finalAQI = Math.max(10, Math.min(500, baseAQI));
    const details = getAQILevelDetails(finalAQI);

    const pm25 = Number((finalAQI * 0.12).toFixed(1));
    const pm10 = Number((finalAQI * 0.25).toFixed(1));
    const o3 = Number((finalAQI * 0.4).toFixed(1));
    const no2 = Number((finalAQI * 0.18).toFixed(1));
    const so2 = Number((finalAQI * 0.08).toFixed(1));
    const co = Number((finalAQI * 0.008).toFixed(2));

    // Generate 24 hours historical trend
    const trend: { time: string; aqi: number }[] = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const histDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const timeStr = histDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const histAQI = Math.max(10, Math.min(500, Math.floor(finalAQI * (1 + Math.sin(timeSeed + i * 0.3 + index) * 0.15))));
      trend.push({
        time: timeStr,
        aqi: histAQI
      });
    }

    return {
      city: item.city,
      country: item.country,
      aqi: finalAQI,
      status: details.status,
      mainPollutant: details.mainPollutant,
      healthMessage: details.healthMessage,
      lastUpdated: new Date().toISOString(),
      pollutants: { pm25, pm10, o3, no2, so2, co },
      trend,
      pm25,
      pm10,
      co,
      o3,
      lat: item.lat,
      lon: item.lon
    };
  });
}

export function generateMockCountries(timeSeed: number): CountryStat[] {
  const baseCountries: Record<string, {
    capital: string;
    region: string;
    population: number;
    languages: string[];
    currencies: string[];
    livability: number;
    gdp: number;
    tags: string[];
  }> = {
    US: { capital: 'Washington D.C.', region: 'Americas', population: 334000000, languages: ['English'], currencies: ['USD'], livability: 78, gdp: 25440000000000, tags: ['North America', 'G7', 'Diverse'] },
    GB: { capital: 'London', region: 'Europe', population: 673000000, languages: ['English'], currencies: ['GBP'], livability: 82, gdp: 3080000000000, tags: ['Europe', 'G7', 'Island Nation'] },
    JP: { capital: 'Tokyo', region: 'Asia', population: 125100000, languages: ['Japanese'], currencies: ['JPY'], livability: 88, gdp: 4230000000000, tags: ['Asia', 'G7', 'Island Nation'] },
    FR: { capital: 'Paris', region: 'Europe', population: 67970000, languages: ['French'], currencies: ['EUR'], livability: 84, gdp: 2780000000000, tags: ['EU', 'G7', 'Cultural'] },
    DE: { capital: 'Berlin', region: 'Europe', population: 83800000, languages: ['German'], currencies: ['EUR'], livability: 85, gdp: 4070000000000, tags: ['EU', 'G7', 'Industrial'] },
    PH: { capital: 'Manila', region: 'Asia', population: 115600000, languages: ['Filipino', 'English'], currencies: ['PHP'], livability: 65, gdp: 404000000000, tags: ['Asia', 'Archipelago', 'Tropical'] },
    AU: { capital: 'Canberra', region: 'Oceania', population: 26000000, languages: ['English'], currencies: ['AUD'], livability: 89, gdp: 1680000000000, tags: ['Oceania', 'Island Continent', 'Diverse'] },
    CA: { capital: 'Ottawa', region: 'Americas', population: 38900000, languages: ['English', 'French'], currencies: ['CAD'], livability: 87, gdp: 2140000000000, tags: ['North America', 'G7', 'Bilingual'] },
    BR: { capital: 'Brasília', region: 'Americas', population: 214300000, languages: ['Portuguese'], currencies: ['BRL'], livability: 68, gdp: 1920000000000, tags: ['South America', 'BRICS', 'Tropical'] },
    ZA: { capital: 'Pretoria', region: 'Africa', population: 59900000, languages: ['Zulu', 'Xhosa', 'Afrikaans', 'English'], currencies: ['ZAR'], livability: 62, gdp: 405000000000, tags: ['Africa', 'BRICS', 'Diverse'] },
    IN: { capital: 'New Delhi', region: 'Asia', population: 1417000000, languages: ['Hindi', 'English'], currencies: ['INR'], livability: 60, gdp: 3390000000000, tags: ['South Asia', 'BRICS', 'Megadiverse'] },
    SG: { capital: 'Singapore', region: 'Asia', population: 5640000, languages: ['English', 'Malay', 'Mandarin', 'Tamil'], currencies: ['SGD'], livability: 91, gdp: 466000000000, tags: ['Southeast Asia', 'Financial Hub', 'Island City'] },
    AE: { capital: 'Abu Dhabi', region: 'Asia', population: 9400000, languages: ['Arabic', 'English'], currencies: ['AED'], livability: 79, gdp: 507000000000, tags: ['Middle East', 'Desert', 'Innovation'] },
    MX: { capital: 'Mexico City', region: 'Americas', population: 127500000, languages: ['Spanish'], currencies: ['MXN'], livability: 70, gdp: 1410000000000, tags: ['Latin America', 'G20', 'Diverse'] },
    KR: { capital: 'Seoul', region: 'Asia', population: 51800000, languages: ['Korean'], currencies: ['KRW'], livability: 81, gdp: 1670000000000, tags: ['Asia', 'High Tech', 'Innovation'] },
    ES: { capital: 'Madrid', region: 'Europe', population: 47400000, languages: ['Spanish'], currencies: ['EUR'], livability: 83, gdp: 1400000000000, tags: ['EU', 'Mediterranean', 'Cultural'] },
    IT: { capital: 'Rome', region: 'Europe', population: 59000000, languages: ['Italian'], currencies: ['EUR'], livability: 80, gdp: 2010000000000, tags: ['EU', 'G7', 'History'] },
    NL: { capital: 'Amsterdam', region: 'Europe', population: 17500000, languages: ['Dutch'], currencies: ['EUR'], livability: 88, gdp: 1000000000000, tags: ['EU', 'Liberal', 'Bicycles'] },
    CH: { capital: 'Bern', region: 'Europe', population: 8700000, languages: ['German', 'French', 'Italian'], currencies: ['CHF'], livability: 92, gdp: 800000000000, tags: ['Europe', 'Alps', 'Financial'] },
    SE: { capital: 'Stockholm', region: 'Europe', population: 10400000, languages: ['Swedish'], currencies: ['SEK'], livability: 89, gdp: 590000000000, tags: ['Europe', 'Scandinavia', 'Social Policy'] },
    NO: { capital: 'Oslo', region: 'Europe', population: 5400000, languages: ['Norwegian'], currencies: ['NOK'], livability: 90, gdp: 480000000000, tags: ['Europe', 'Scandinavia', 'Fjords'] },
    NZ: { capital: 'Wellington', region: 'Oceania', population: 5120000, languages: ['English', 'Māori'], currencies: ['NZD'], livability: 89, gdp: 250000000000, tags: ['Oceania', 'Scenic', 'Adventure'] },
    AR: { capital: 'Buenos Aires', region: 'Americas', population: 45800000, languages: ['Spanish'], currencies: ['ARS'], livability: 69, gdp: 490000000000, tags: ['South America', 'Tango', 'Football'] },
    EG: { capital: 'Cairo', region: 'Africa', population: 109000000, languages: ['Arabic'], currencies: ['EGP'], livability: 60, gdp: 400000000000, tags: ['Africa', 'Pyramids', 'History'] },
    TR: { capital: 'Ankara', region: 'Asia', population: 85000000, languages: ['Turkish'], currencies: ['TRY'], livability: 66, gdp: 900000000000, tags: ['Transcontinental', 'History', 'Culinary'] },
    SA: { capital: 'Riyadh', region: 'Asia', population: 36000000, languages: ['Arabic'], currencies: ['SAR'], livability: 74, gdp: 1100000000000, tags: ['Middle East', 'Oil', 'G20'] },
    VN: { capital: 'Hanoi', region: 'Asia', population: 98000000, languages: ['Vietnamese'], currencies: ['VND'], livability: 63, gdp: 410000000000, tags: ['Southeast Asia', 'Tropical', 'Rapid Growth'] },
    TH: { capital: 'Bangkok', region: 'Asia', population: 71600000, languages: ['Thai'], currencies: ['THB'], livability: 68, gdp: 500000000000, tags: ['Southeast Asia', 'Tourism', 'Tropical'] }
  };

  return MONITORED_CITIES.map((cityObj, index) => {
    const code = cityObj.code;
    const info = baseCountries[code] || {
      capital: 'Capital',
      region: 'Global',
      population: 50000000,
      languages: ['English'],
      currencies: ['USD'],
      livability: 75,
      gdp: 1000000000000,
      tags: ['Global']
    };

    // Generate historical metrics
    const historicalPopulation: { year: number; population: number }[] = [];
    const historicalGdp: { year: number; gdp: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const year = 2017 + i;
      // Population slow growth
      historicalPopulation.push({
        year,
        population: Math.floor(info.population * (1 + (i - 9) * 0.005))
      });
      // GDP fluctuating upward
      historicalGdp.push({
        year,
        gdp: Math.floor(info.gdp * (1 + (i - 9) * 0.02 + Math.sin(timeSeed * 0.5 + i + index) * 0.01))
      });
    }

    return {
      code,
      name: cityObj.country,
      capital: info.capital,
      region: info.region,
      population: info.population,
      languages: info.languages,
      currencies: info.currencies,
      livabilityIndex: info.livability,
      gdp: info.gdp,
      tags: info.tags,
      historicalPopulation,
      historicalGdp
    };
  });
}
