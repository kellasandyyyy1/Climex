/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCryptoData, getWeatherData, getCurrencyData, getAQIData } from '../server/adapters';
import { alertsList, evaluateRules, seedInitialAlerts } from '../server/alertsEngine';

// Track whether this warm instance has seeded alerts yet.
// On a cold start this resets to false, which is expected/acceptable.
let seeded = false;

export default async function handler(req: any, res: any) {
  try {
    // Seed once per warm instance so the alerts feed isn't empty on first load
    if (!seeded) {
      await seedInitialAlerts(getCryptoData, getWeatherData, getCurrencyData, getAQIData);
      seeded = true;
    } else {
      // Re-evaluate rules against fresh data on every poll so alerts stay current
      // (replaces the old setInterval background loop from server.ts)
      const [crypto, weather, currency, aqi] = await Promise.all([
        getCryptoData(),
        getWeatherData(),
        getCurrencyData(),
        getAQIData()
      ]);
      evaluateRules(crypto.data, weather.data, currency.data, aqi.data);
    }

    const since = req.query?.since ? Number(req.query.since) : 0;
    if (since) {
      const filtered = alertsList.filter((a) => new Date(a.createdAt).getTime() > since);
      return res.status(200).json({ alerts: filtered });
    }

    res.status(200).json({ alerts: alertsList });
  } catch (err) {
    console.error('Alerts endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}
