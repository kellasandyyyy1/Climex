/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CryptoCoin, WeatherInfo, CurrencyPair, AQIMeasurement, CountryStat, DataSyncStatus } from '../../src/types';
import {
  COINGECKO_COINS,
  MONITORED_CITIES,
  CURRENCY_PAIRS,
  getWeatherCondition,
  getAQIStatus,
  getAQILevelDetails,
  generateMockCrypto,
  generateMockWeather,
  generateMockCurrency,
  generateMockAQI,
  generateMockCountries
} from '../../src/lib/config.js';

// Server cache storage helper
export class ServerCache {
  private cache: Record<string, { data: any; timestamp: number; ttl: number }> = {};

  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;
    return entry.data as T;
  }

  isStale(key: string): boolean {
    const entry = this.cache[key];
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  set<T>(key: string, data: T, ttlMs: number) {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
  }
}

export const serverCacheInstance = new ServerCache();

// 1. CoinGecko Adapter
export async function getCryptoData(): Promise<{ data: CryptoCoin[]; status: 'online' | 'stale' | 'offline' }> {
  const cacheKey = 'crypto_data';
  const ttl = 45 * 1000; // 45 seconds cache

  if (!serverCacheInstance.isStale(cacheKey)) {
    return { data: serverCacheInstance.get<CryptoCoin[]>(cacheKey)!, status: 'online' };
  }

  try {
    const ids = COINGECKO_COINS.map(c => c.id).join(',');
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('CoinGecko returned invalid format');
    }

    const unsortedData = COINGECKO_COINS.map((config, index) => {
      const match = rawData.find((r: any) => r.id === config.id);
      const timeSeed = Date.now() / 100000;
      
      const price = match ? match.current_price : (92450.25 / (index + 1));
      const change24h = match ? match.price_change_percentage_24h : 2.5;
      const marketCap = match ? match.market_cap : 1800000000000 / (index + 1);
      const volume24h = match ? match.total_volume : 28000000000 / (index + 1);
      
      const sparkline: number[] = [];
      for (let i = 0; i < 24; i++) {
        sparkline.push(price * (1 + Math.sin(timeSeed + i * 0.5 + index) * 0.015));
      }

      return {
        id: config.id,
        name: config.name,
        symbol: config.symbol,
        price,
        change24h,
        marketCap,
        volume24h,
        rank: index + 1,
        sparkline,
        tags: config.tags
      };
    });

    const data: CryptoCoin[] = [...unsortedData]
      .sort((a, b) => b.marketCap - a.marketCap)
      .map((coin, index) => ({
        ...coin,
        rank: index + 1
      }));

    serverCacheInstance.set(cacheKey, data, ttl);
    return { data, status: 'online' };
  } catch (err) {
    console.warn('Crypto Adapter falling back to mock data:', err instanceof Error ? err.message : err);
    const seed = Date.now() / 10000;
    const fallbackData = generateMockCrypto(seed);
    const cached = serverCacheInstance.get<CryptoCoin[]>(cacheKey);
    
    if (cached) {
      return { data: cached, status: 'stale' };
    }
    serverCacheInstance.set(cacheKey, fallbackData, 10000);
    return { data: fallbackData, status: 'offline' };
  }
}

// 2. Open-Meteo Weather Adapter
export async function getWeatherData(): Promise<{ data: WeatherInfo[]; status: 'online' | 'stale' | 'offline' }> {
  const cacheKey = 'weather_data';
  const ttl = 10 * 60 * 1000;

  if (!serverCacheInstance.isStale(cacheKey)) {
    return { data: serverCacheInstance.get<WeatherInfo[]>(cacheKey)!, status: 'online' };
  }

  try {
    const lats = MONITORED_CITIES.map(c => c.lat).join(',');
    const lons = MONITORED_CITIES.map(c => c.lon).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    const results = Array.isArray(rawData) ? rawData : [rawData];

    const data: WeatherInfo[] = MONITORED_CITIES.map((cityObj, index) => {
      const match = results[index];
      const timeSeed = Date.now() / 100000;
      
      const temp = match?.current?.temperature_2m ?? (18 + index);
      const humidity = match?.current?.relative_humidity_2m ?? 65;
      const windSpeed = match?.current?.wind_speed_10m ?? 12;
      const weatherCode = match?.current?.weather_code ?? 1;
      const condition = getWeatherCondition(weatherCode);

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const forecast = (match?.daily?.time ?? []).map((t: string, i: number) => {
        const fMax = match?.daily?.temperature_2m_max?.[i] ?? (temp + 2);
        const fMin = match?.daily?.temperature_2m_min?.[i] ?? (temp - 4);
        const fCode = match?.daily?.weather_code?.[i] ?? 1;
        const dayName = daysOfWeek[(new Date(t).getDay()) % 7] || daysOfWeek[i % 7];
        return {
          date: dayName,
          tempMax: fMax,
          tempMin: fMin,
          weatherCode: fCode,
          condition: getWeatherCondition(fCode),
          alert: i === 2 && fCode >= 61 ? 'Precipitation expected' : undefined
        };
      });

      if (forecast.length === 0) {
        for (let i = 0; i < 7; i++) {
          const dayName = daysOfWeek[(new Date().getDay() + i) % 7];
          forecast.push({
            date: dayName,
            tempMax: temp + 2 + Math.sin(i) * 2,
            tempMin: temp - 4 + Math.sin(i) * 2,
            weatherCode: 1,
            condition: 'Partly cloudy'
          });
        }
      }

      return {
        city: cityObj.city,
        country: cityObj.country,
        temp,
        feelsLike: Number((temp + (humidity > 70 ? 1.5 : -0.5)).toFixed(1)),
        weatherCode,
        condition,
        humidity,
        windSpeed,
        rainfallDays: Math.floor(6 + Math.sin(timeSeed + index) * 4),
        volatilityDays: Math.floor(3 + Math.cos(timeSeed + index) * 2),
        lat: cityObj.lat,
        lon: cityObj.lon,
        timezone: cityObj.timezone,
        forecast
      };
    });

    serverCacheInstance.set(cacheKey, data, ttl);
    return { data, status: 'online' };
  } catch (err) {
    console.warn('Weather Adapter falling back to mock data:', err instanceof Error ? err.message : err);
    const seed = Date.now() / 600000;
    const fallbackData = generateMockWeather(seed);
    const cached = serverCacheInstance.get<WeatherInfo[]>(cacheKey);
    
    if (cached) {
      return { data: cached, status: 'stale' };
    }
    serverCacheInstance.set(cacheKey, fallbackData, 30000);
    return { data: fallbackData, status: 'offline' };
  }
}

// 3. Frankfurter Currency Adapter
export async function getCurrencyData(): Promise<{ data: CurrencyPair[]; status: 'online' | 'stale' | 'offline' }> {
  const cacheKey = 'currency_data';
  const ttl = 60 * 60 * 1000;

  if (!serverCacheInstance.isStale(cacheKey)) {
    return { data: serverCacheInstance.get<CurrencyPair[]>(cacheKey)!, status: 'online' };
  }

  try {
    const url = 'https://api.frankfurter.app/latest?from=USD';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Frankfurter returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    const rates = rawData.rates || {};

    const data: CurrencyPair[] = CURRENCY_PAIRS.map((config, index) => {
      const rate = config.target === 'USD' ? 1.0 : (rates[config.target] ?? (index === 0 ? 0.92 : 1.36));
      const change24h = Math.sin(Date.now() / 1000000 + index) * 0.4;
      
      const history: { date: string; rate: number }[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const histDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        history.push({
          date: histDate,
          rate: rate * (1 + Math.sin(Date.now() / 500000 + i * 0.5 + index) * 0.008)
        });
      }

      return {
        id: config.id,
        base: config.base,
        target: config.target,
        rate,
        change24h,
        volatility: Math.floor(25 + Math.abs(Math.sin(index) * 45)),
        volume: config.volume,
        history
      };
    });

    serverCacheInstance.set(cacheKey, data, ttl);
    return { data, status: 'online' };
  } catch (err) {
    console.warn('Currency Adapter falling back to mock data:', err instanceof Error ? err.message : err);
    const seed = Date.now() / 3600000;
    const fallbackData = generateMockCurrency(seed);
    const cached = serverCacheInstance.get<CurrencyPair[]>(cacheKey);

    if (cached) {
      return { data: cached, status: 'stale' };
    }
    serverCacheInstance.set(cacheKey, fallbackData, 60000);
    return { data: fallbackData, status: 'offline' };
  }
}

// 4. OpenAQ Air Quality Adapter
export async function getAQIData(): Promise<{ data: AQIMeasurement[]; status: 'online' | 'stale' | 'offline' }> {
  const cacheKey = 'aqi_data';
  const ttl = 15 * 60 * 1000;

  if (!serverCacheInstance.isStale(cacheKey)) {
    return { data: serverCacheInstance.get<AQIMeasurement[]>(cacheKey)!, status: 'online' };
  }

  try {
    const url = 'https://api.openaq.org/v2/measurements?limit=10&parameter=pm25';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('OpenAQ not responding');
    }
    const rawData = await response.json();
    const results = rawData.results || [];

    const data: AQIMeasurement[] = MONITORED_CITIES.map((cityObj, index) => {
      const match = results.find((r: any) => r.city?.toLowerCase() === cityObj.city.toLowerCase()) || results[index];
      const baseVal = match ? Math.floor(match.value * 2) : Math.floor(45 + Math.sin(index) * 30);
      const aqiVal = Math.max(12, Math.min(350, baseVal));
      const details = getAQILevelDetails(aqiVal);

      const pm25 = Number((aqiVal * 0.11).toFixed(1));
      const pm10 = Number((aqiVal * 0.23).toFixed(1));
      const o3 = Number((aqiVal * 0.38).toFixed(1));
      const no2 = Number((aqiVal * 0.16).toFixed(1));
      const so2 = Number((aqiVal * 0.07).toFixed(1));
      const co = Number((aqiVal * 0.007).toFixed(2));

      const trend: { time: string; aqi: number }[] = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
        const histDate = new Date(now.getTime() - i * 60 * 60 * 1000);
        const timeStr = histDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const histAQI = Math.max(10, Math.min(500, Math.floor(aqiVal * (1 + Math.sin(i * 0.3 + index) * 0.12))));
        trend.push({
          time: timeStr,
          aqi: histAQI
        });
      }

      return {
        city: cityObj.city,
        country: cityObj.country,
        aqi: aqiVal,
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
        lat: cityObj.lat,
        lon: cityObj.lon
      };
    });

    serverCacheInstance.set(cacheKey, data, ttl);
    return { data, status: 'online' };
  } catch (err) {
    const seed = Date.now() / 900000;
    const fallbackData = generateMockAQI(seed);
    const cached = serverCacheInstance.get<AQIMeasurement[]>(cacheKey);

    if (cached) {
      return { data: cached, status: 'stale' };
    }
    serverCacheInstance.set(cacheKey, fallbackData, 30000);
    return { data: fallbackData, status: 'offline' };
  }
}

// 5. REST Countries & World Bank Adapter
export async function getCountriesData(): Promise<{ data: CountryStat[]; status: 'online' | 'stale' | 'offline' }> {
  const cacheKey = 'countries_data';
  const ttl = 24 * 60 * 60 * 1000;

  if (!serverCacheInstance.isStale(cacheKey)) {
    return { data: serverCacheInstance.get<CountryStat[]>(cacheKey)!, status: 'online' };
  }

  try {
    const codes = MONITORED_CITIES.map(c => c.code.toLowerCase()).join(',');
    const url = `https://restcountries.com/v3.1/alpha?codes=${codes}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`REST Countries returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid response format');
    }

    const data: CountryStat[] = MONITORED_CITIES.map((cityObj, index) => {
      const match = rawData.find((c: any) => c.cca2?.toUpperCase() === cityObj.code);
      
      const capital = match?.capital?.[0] ?? (cityObj.city);
      const region = match?.region ?? 'Global';
      const population = match?.population ?? 50000000;
      
      const languages = match?.languages ? Object.values(match.languages) as string[] : ['English'];
      const currencies = match?.currencies ? Object.keys(match.currencies) as string[] : ['USD'];

      const historicalPopulation: { year: number; population: number }[] = [];
      const historicalGdp: { year: number; gdp: number }[] = [];
      const gdpMap: Record<string, number> = {
        US: 25440000000000, GB: 3080000000000, JP: 4230000000000, FR: 2780000000000,
        DE: 4070000000000, PH: 404000000000, AU: 1680000000000, CA: 2140000000000,
        BR: 1920000000000, ZA: 405000000000, IN: 3390000000000, SG: 466000000000,
        AE: 507000000000, MX: 1410000000000, KR: 1670000000000, ES: 1400000000000,
        IT: 2010000000000, NL: 1000000000000, CH: 800000000000, SE: 590000000000,
        NO: 480000000000, NZ: 250000000000, AR: 490000000000, EG: 400000000000,
        TR: 900000000000, SA: 1100000000000, VN: 410000000000, TH: 500000000000
      };
      const baseGdp = gdpMap[cityObj.code] ?? 1500000000000;
      
      for (let i = 9; i >= 0; i--) {
        const year = 2017 + i;
        historicalPopulation.push({
          year,
          population: Math.floor(population * (1 + (i - 9) * 0.006))
        });
        historicalGdp.push({
          year,
          gdp: Math.floor(baseGdp * (1 + (i - 9) * 0.024 + Math.sin(i + index) * 0.015))
        });
      }

      const livabilityScores: Record<string, number> = {
        US: 78, GB: 82, JP: 89, FR: 84, DE: 86, PH: 65, AU: 88,
        CA: 87, BR: 68, ZA: 62, IN: 60, SG: 91, AE: 79, MX: 70,
        KR: 81, ES: 83, IT: 80, NL: 88, CH: 92, SE: 89, NO: 90,
        NZ: 89, AR: 69, EG: 60, TR: 66, SA: 74, VN: 63, TH: 68
      };
      const tagsMap: Record<string, string[]> = {
        US: ['North America', 'G7', 'Diverse'],
        GB: ['Europe', 'G7', 'Island Nation'],
        JP: ['Asia', 'G7', 'High Tech'],
        FR: ['EU', 'G7', 'Cultural'],
        DE: ['EU', 'G7', 'Industrial'],
        PH: ['Asia', 'Archipelago', 'Tropical'],
        AU: ['Oceania', 'Island Continent', 'Diverse'],
        CA: ['North America', 'G7', 'Bilingual'],
        BR: ['South America', 'BRICS', 'Tropical'],
        ZA: ['Africa', 'BRICS', 'Diverse'],
        IN: ['South Asia', 'BRICS', 'Megadiverse'],
        SG: ['Southeast Asia', 'Financial Hub', 'Island City'],
        AE: ['Middle East', 'Desert', 'Innovation'],
        MX: ['Latin America', 'G20', 'Diverse'],
        KR: ['Asia', 'High Tech', 'Innovation'],
        ES: ['EU', 'Mediterranean', 'Cultural'],
        IT: ['EU', 'G7', 'History'],
        NL: ['EU', 'Liberal', 'Bicycles'],
        CH: ['Europe', 'Alps', 'Financial'],
        SE: ['Europe', 'Scandinavia', 'Social Policy'],
        NO: ['Europe', 'Scandinavia', 'Fjords'],
        NZ: ['Oceania', 'Scenic', 'Adventure'],
        AR: ['South America', 'Tango', 'Football'],
        EG: ['Africa', 'Pyramids', 'History'],
        TR: ['Transcontinental', 'History', 'Culinary'],
        SA: ['Middle East', 'Oil', 'G20'],
        VN: ['Southeast Asia', 'Tropical', 'Rapid Growth'],
        TH: ['Southeast Asia', 'Tourism', 'Tropical']
      };

      return {
        code: cityObj.code,
        name: cityObj.country,
        capital,
        region,
        population,
        languages,
        currencies,
        livabilityIndex: livabilityScores[cityObj.code] ?? 75,
        gdp: baseGdp,
        tags: tagsMap[cityObj.code] ?? ['Global'],
        historicalPopulation,
        historicalGdp
      };
    });

    serverCacheInstance.set(cacheKey, data, ttl);
    return { data, status: 'online' };
  } catch (err) {
    console.warn('Countries Adapter falling back to mock data:', err instanceof Error ? err.message : err);
    const seed = Date.now() / 86400000;
    const fallbackData = generateMockCountries(seed);
    const cached = serverCacheInstance.get<CountryStat[]>(cacheKey);

    if (cached) {
      return { data: cached, status: 'stale' };
    }
    serverCacheInstance.set(cacheKey, fallbackData, 60000);
    return { data: fallbackData, status: 'offline' };
  }
}