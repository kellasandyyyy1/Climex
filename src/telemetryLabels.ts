/**
 * UI labels and copy for the Data Sync Status (formerly Proxy Telemetry Logs) panel.
 * Separates user-facing plain language from presentation/logic.
 */

export interface TelemetryLabelItem {
  title: string;
  desc: string;
}

export interface TelemetryLabelsType {
  panelTitle: string;
  panelSubtitle: string;
  healthLabel: string;
  exportButtonText: string;
  sources: {
    coingecko: TelemetryLabelItem;
    openMeteo: TelemetryLabelItem;
    frankfurter: TelemetryLabelItem;
    restCountries: TelemetryLabelItem;
  };
}

export const telemetryLabels: TelemetryLabelsType = {
  panelTitle: 'Data sync status',
  panelSubtitle: 'How up-to-date your data is',
  healthLabel: 'up to date',
  exportButtonText: 'Download full activity log',
  sources: {
    coingecko: {
      title: 'Crypto prices',
      desc: 'Updated for all coins',
    },
    openMeteo: {
      title: 'Weather',
      desc: 'Updated for all locations',
    },
    frankfurter: {
      title: 'Currency rates',
      desc: 'Checked and current',
    },
    restCountries: {
      title: 'Country data',
      desc: 'Population figures refreshed',
    },
  },
};
