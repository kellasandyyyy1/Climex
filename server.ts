/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { getCryptoData, getWeatherData, getCurrencyData, getAQIData, getCountriesData } from './api/_lib/adapters';
import { alertsList, evaluateRules, seedInitialAlerts, registerBroadcastCallback, addAlert } from './api/_lib/alertsEngine';
import { Alert } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Attach HTTP Server for WebSocket integration
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Track connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Immediately push initial active alerts list to newly connected client
    ws.send(JSON.stringify({ type: 'init', alerts: alertsList }));

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket connection error (handled):', err);
      clients.delete(ws);
    });
  });

  // Register broadcast callback to send any newly generated alert to all clients
  registerBroadcastCallback((newAlert) => {
    const payload = JSON.stringify({ type: 'new_alert', alert: newAlert });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  // Seed initial alerts on server boot
  await seedInitialAlerts(getCryptoData, getWeatherData, getCurrencyData, getAQIData);

  // Set up background rules engine to poll adapters and evaluate thresholds every 15 seconds
  setInterval(async () => {
    try {
      const [crypto, weather, currency, aqi] = await Promise.all([
        getCryptoData(),
        getWeatherData(),
        getCurrencyData(),
        getAQIData()
      ]);
      evaluateRules(crypto.data, weather.data, currency.data, aqi.data);
    } catch (err) {
      console.error('Error in background rules evaluation:', err);
    }
  }, 15000);

  // API Endpoints
  app.get('/api/dashboard', async (req, res) => {
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

      res.json({
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
  });

  // Fetch alerts endpoint (robust fallback for long-interval client polling)
  app.get('/api/alerts', (req, res) => {
    const since = req.query.since ? Number(req.query.since) : 0;
    if (since) {
      const filtered = alertsList.filter(a => new Date(a.createdAt).getTime() > since);
      return res.json({ alerts: filtered });
    }
    res.json({ alerts: alertsList });
  });

  // Trigger manual threshold simulation to verify real-time alert pipeline
  app.post('/api/alerts/simulate', (req, res) => {
    try {
      const { category, severity, headline, detail, sourceMetric, value, targetEntity, extraInfo } = req.body;
      
      const customAlert: Alert = {
        id: `sim-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        category: category || 'crypto',
        severity: severity || 'needs-attention',
        headline: headline || 'Simulation Spike Triggered',
        detail: detail || 'Manually injected event-driven rule crossing threshold for validation.',
        createdAt: new Date().toISOString(),
        icon: category === 'crypto' ? 'coin-stack' : category === 'weather' ? 'cloud-sun' : category === 'aqi' ? 'wind' : 'currency',
        sourceEvent: {
          metric: sourceMetric || 'price_change',
          value: value !== undefined ? Number(value) : 4.5,
          targetEntity: targetEntity || 'simulation-node',
          extraInfo: extraInfo || {}
        }
      };

      addAlert(customAlert);
      res.json({ success: true, alert: customAlert });
    } catch (err) {
      console.error('Simulation error:', err);
      res.status(500).json({ error: 'Failed to trigger simulation' });
    }
  });

  // Individual endpoint helpers for detailed widgets
  app.get('/api/crypto', async (req, res) => {
    try {
      const result = await getCryptoData();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch crypto data' });
    }
  });

  app.get('/api/weather', async (req, res) => {
    try {
      const result = await getWeatherData();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  app.get('/api/currency', async (req, res) => {
    try {
      const result = await getCurrencyData();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch currency data' });
    }
  });

  app.get('/api/air-quality', async (req, res) => {
    try {
      const result = await getAQIData();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch air quality data' });
    }
  });

  app.get('/api/countries', async (req, res) => {
    try {
      const result = await getCountriesData();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch countries data' });
    }
  });

  // Vite middleware for development vs static asset serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to HTTP server (handling both standard requests and upgraded WebSocket connections)
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
