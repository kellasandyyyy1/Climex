/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addAlert } from '../_lib/alertsEngine';
import type { Alert } from '../_lib/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, severity, headline, detail, sourceMetric, value, targetEntity, extraInfo } = req.body || {};

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
    res.status(200).json({ success: true, alert: customAlert });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: 'Failed to trigger simulation' });
  }
}
