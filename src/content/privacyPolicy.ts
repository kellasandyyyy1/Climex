/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Privacy policy content.
 *
 * This is the single source of truth for the /privacy-policy page. Edit dates,
 * providers, and wording here — the page layout in
 * `src/components/PrivacyPolicy.tsx` renders whatever this file describes and
 * never needs to change when the text does.
 *
 * Adding a section: append to PRIVACY_POLICY.sections. The table of contents,
 * section numbering, and anchor links are all derived automatically.
 */

export type PolicyBlock =
  /** A paragraph of body copy. */
  | { kind: 'text'; text: string }
  /** A bulleted list. */
  | { kind: 'list'; items: string[] }
  /** A nested sub-section (e.g. "2.1 Location Data"). */
  | { kind: 'subsection'; title: string; blocks: PolicyBlock[] }
  /** A named third-party service, rendered as a linked card. */
  | { kind: 'providers'; items: PolicyProvider[] }
  /** A highlighted call-out for the most important takeaways. */
  | { kind: 'callout'; tone: 'accent' | 'success'; title: string; text: string };

export interface PolicyProvider {
  /** What the provider powers, e.g. "Crypto data". */
  category: string;
  name: string;
  url: string;
  purpose: string;
}

export interface PolicySection {
  /** URL anchor / table-of-contents target. Must be unique and stable. */
  id: string;
  title: string;
  blocks: PolicyBlock[];
}

export interface PolicyDocument {
  title: string;
  /** Shown under the title; update whenever the policy text changes. */
  lastUpdated: string;
  /** One-line summary shown in the page header. */
  intro: string;
  contactEmail: string;
  sections: PolicySection[];
}

export const PRIVACY_POLICY: PolicyDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'August 15, 2026',
  intro:
    'How Climex handles your location, what we collect, and which third-party services power the dashboard.',
  contactEmail: 'support@climex-analytics.com',

  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Climex ("we", "our", "the Site") provides a real-time dashboard for cryptocurrency prices, weather conditions, air quality, and currency exchange rates. This policy explains what data we collect, why, and how it is handled.',
        },
        {
          kind: 'callout',
          tone: 'success',
          title: 'The short version',
          text: 'There are no accounts, no cookies, and no advertising. Your precise coordinates are matched to a nearby city inside your browser and never reach our servers. Your preferences stay in your own browser storage.',
        },
      ],
    },

    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      blocks: [
        {
          kind: 'subsection',
          title: 'Location Data',
          blocks: [
            {
              kind: 'text',
              text: "We request access to your device's geolocation to show weather, air quality, and regional data relevant to you. Location is:",
            },
            {
              kind: 'list',
              items: [
                'Resolved entirely in your browser — your coordinates are compared against a fixed list of monitored cities, and only the name of the nearest city is used to pick which data to display',
                'Never transmitted to our servers; we do not log, store, or retain your raw latitude and longitude',
                'Not persisted between sessions unless you choose a city yourself, in which case that city name (not your coordinates) is saved in your browser',
                'Never sold or shared with advertisers',
                'Optional — you may deny location access, and the dashboard falls back to a previously selected city or to a clearly labelled default',
              ],
            },
          ],
        },
        {
          kind: 'subsection',
          title: 'Automatically Collected Data',
          blocks: [
            {
              kind: 'list',
              items: [
                'IP address — visible to our hosting provider in standard server logs and used for rate-limiting and abuse prevention',
                'Browser type, device type, and approximate request timing, as recorded in those same standard server logs',
                'We do not currently run any third-party analytics, tracking pixels, or advertising scripts on the Site',
              ],
            },
          ],
        },
        {
          kind: 'subsection',
          title: 'Information We Do Not Collect',
          blocks: [
            {
              kind: 'list',
              items: [
                'We do not collect wallet addresses, private keys, seed phrases, or crypto transaction data — Climex is read-only and never connects to a wallet',
                'We do not require account creation, and we do not collect passwords or payment details',
                'We do not collect your raw GPS coordinates',
              ],
            },
          ],
        },
      ],
    },

    {
      id: 'third-party-apis',
      title: 'Third-Party APIs',
      blocks: [
        {
          kind: 'text',
          text: 'Dashboard content is retrieved by our own backend, which then relays it to your browser. Because these requests are made server-side, the providers below receive our server\'s request — not your IP address or your coordinates.',
        },
        {
          kind: 'providers',
          items: [
            {
              category: 'Crypto data',
              name: 'CoinGecko',
              url: 'https://www.coingecko.com/en/privacy',
              purpose: 'Market prices, 24-hour movement, and rankings for tracked assets',
            },
            {
              category: 'Weather data',
              name: 'Open-Meteo',
              url: 'https://open-meteo.com/en/terms',
              purpose: 'Current conditions and daily forecasts for monitored cities',
            },
            {
              category: 'Currency exchange',
              name: 'Frankfurter',
              url: 'https://frankfurter.dev',
              purpose: 'Reference foreign exchange rates published by central banks',
            },
            {
              category: 'Air quality',
              name: 'OpenAQ',
              url: 'https://openaq.org/privacy',
              purpose: 'Ground-station pollutant measurements used for AQI readings',
            },
            {
              category: 'Country reference',
              name: 'REST Countries',
              url: 'https://restcountries.com',
              purpose: 'Static reference data such as population, region, and currency',
            },
          ],
        },
        {
          kind: 'text',
          text: 'Each provider operates under its own privacy policy, linked above. We do not send them any personal information about you.',
        },
      ],
    },

    {
      id: 'how-we-use-your-data',
      title: 'How We Use Your Data',
      blocks: [
        {
          kind: 'list',
          items: [
            'To display real-time, location-relevant dashboard content',
            'To remember your display preferences, such as theme, temperature unit, and refresh interval',
            'To maintain the performance, reliability, and security of the Site',
            'We do not use your data for targeted advertising, profiling, or resale',
          ],
        },
      ],
    },

    {
      id: 'data-storage-security',
      title: 'Data Storage & Security',
      blocks: [
        {
          kind: 'text',
          text: 'Your preferences are stored only in your own browser using localStorage. They are not sent to our backend and are not accessible to us. The values we store are:',
        },
        {
          kind: 'list',
          items: [
            'Your selected city, if you choose one manually',
            'Your display name, if you enter one',
            'Your theme, temperature unit, default currency, and refresh interval',
            'Any price alerts you configure',
          ],
        },
        {
          kind: 'list',
          items: [
            'All traffic between your browser and the Site is encrypted over HTTPS',
            'We do not sell, rent, or trade your personal data',
            'We keep no user database, so there is no stored personal profile to breach',
          ],
        },
      ],
    },

    {
      id: 'your-choices-rights',
      title: 'Your Choices & Rights',
      blocks: [
        {
          kind: 'list',
          items: [
            'You can deny or revoke location permission at any time through your browser settings; the dashboard continues to work with a manually selected city',
            'You can change your city, theme, and other preferences at any time from the dashboard settings',
            'You can erase everything Climex has stored about you by clearing your browser storage for this site',
          ],
        },
        {
          kind: 'callout',
          tone: 'accent',
          title: 'Access and deletion requests',
          text: 'Because we hold no accounts and no server-side personal data, there is generally nothing for us to retrieve or delete on your behalf. If you believe we hold information about you and would like to exercise a right of access, deletion, or portability, contact us and we will respond.',
        },
      ],
    },

    {
      id: 'cookies',
      title: 'Cookies',
      blocks: [
        {
          kind: 'text',
          text: 'Climex does not set cookies. We use browser localStorage for the preferences listed above, which is not shared across sites, is never transmitted to our servers, and is not used for tracking. Clearing site data removes it.',
        },
      ],
    },

    {
      id: 'childrens-privacy',
      title: "Children's Privacy",
      blocks: [
        {
          kind: 'text',
          text: 'This Site is not directed at children under 13, and we do not knowingly collect data from them. If you believe a child has provided us with personal information, please contact us.',
        },
      ],
    },

    {
      id: 'changes',
      title: 'Changes to This Policy',
      blocks: [
        {
          kind: 'text',
          text: 'We may update this policy periodically. Any changes will be posted on this page with an updated revision date at the top.',
        },
      ],
    },

    {
      id: 'contact',
      title: 'Contact',
      blocks: [
        {
          kind: 'text',
          text: 'Questions about this policy, or about how your data is handled, can be sent to our support address below.',
        },
      ],
    },
  ],
};
