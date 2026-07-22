/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCryptoData, getWeatherData, getCurrencyData, getAQIData, getCountriesData } from './_lib/adapters.js';

export default async function handler(req: any, res: any) {
  try {
    const [crypto, weather, currency, aqi, countries] = await Promise.all([
      getCryptoData(),
      getWeatherData(),
      getCurrencyData(),
      getAQIData(),
      getCountriesData()
    ]);

    const syncStatus = [
      { provider: 'CoinGecko', url: 'https://api.coingecko.com', status: crypto.status, lastSync: new Date().toLocaleTimeString() },
      { provider: 'Open-Meteo', url: 'https://api.open-meteo.com', status: weather.status, lastSync: new Date().toLocaleTimeString() },
      { provider: 'Frankfurter', url: 'https://api.frankfurter.app', status: currency.status, lastSync: new Date().toLocaleTimeString() },
      { provider: 'OpenAQ', url: 'https://api.openaq.org', status: aqi.status, lastSync: new Date().toLocaleTimeString() },
      { provider: 'REST Countries', url: 'https://restcountries.com', status: countries.status, lastSync: new Date().toLocaleTimeString() }
    ];

    res.status(200).json({
      crypto: crypto.data,
      weather: weather.data,
      currency: currency.data,
      aqi: aqi.data,
      countries: countries.data,
      syncStatus
    });
  } catch (error) {
    console.error('Dashboard endpoint error:', error);
    res.status(500).json({ error: 'Failed to compile live dashboard statistics' });
  }
}
