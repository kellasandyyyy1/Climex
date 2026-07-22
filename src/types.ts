/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared API and State Types for Climex Dashboard

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  rank: number;
  sparkline: number[];
  tags: string[]; // e.g. ["Layer 1", "DeFi", "Meme"]
}

export interface WeatherDay {
  date: string; // e.g., "2026-07-14"
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
  alert?: string;
}

export interface WeatherInfo {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  weatherCode: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainfallDays: number; // Statistic (out of 30)
  volatilityDays: number; // Statistic (out of 30)
  lat: number;
  lon: number;
  timezone: string;
  forecast: WeatherDay[];
}

export interface CurrencyPair {
  id: string;
  base: string;
  target: string;
  rate: number;
  change24h: number;
  volatility: number; // progress percentage (0-100)
  volume: number;
  history: { date: string; rate: number }[];
}

export interface AQIPollutants {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export interface AQITrendPoint {
  time: string;
  aqi: number;
}

export interface AQIMeasurement {
  city: string;
  country: string;
  aqi: number; // AQI value (0-500)
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  mainPollutant: string;
  healthMessage: string;
  lastUpdated: string;
  pollutants: AQIPollutants;
  trend: AQITrendPoint[];
  pm25: number;
  pm10: number;
  co: number;
  o3: number;
  lat: number;
  lon: number;
}

export interface CountryStat {
  code: string; // ISO 2-letter
  name: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  currencies: string[];
  livabilityIndex: number; // 0-100 gauge score
  gdp: number; // Current GDP in USD
  tags: string[]; // e.g., ["EU", "Island Nation", "Landlocked"]
  historicalPopulation: { year: number; population: number }[];
  historicalGdp: { year: number; gdp: number }[];
}

export interface DataSyncStatus {
  provider: string;
  url: string;
  status: 'online' | 'stale' | 'offline';
  lastSync: string;
}

export interface Alert {
  id: string;
  category: 'crypto' | 'weather' | 'aqi' | 'currency';
  severity: 'needs-attention' | 'fyi';
  headline: string;
  detail: string;
  createdAt: string; // ISO timestamp
  icon: string;      // e.g. 'coin-stack', 'wind', 'cloud-sun', 'currency'
  sourceEvent: {
    metric: string;       // e.g. "price_change", "aqi_level", "precipitation", "exchange_rate"
    value: number;        // the value that triggered it
    targetEntity: string; // e.g. "bitcoin", "London", "USD_EUR"
    extraInfo?: any;
  };
}

export interface DashboardData {
  crypto: CryptoCoin[];
  weather: WeatherInfo[];
  currency: CurrencyPair[];
  aqi: AQIMeasurement[];
  countries: CountryStat[];
  syncStatus: DataSyncStatus[];
}
