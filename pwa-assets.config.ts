import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set from the brand tile in public/icons.
// Run: npx pwa-assets-generator
const BRAND_DARK = '#141413';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: {
      ...minimal2023Preset.transparent,
      sizes: [64, 96, 192, 512],
      favicons: [[48, 'favicon.ico']],
    },
    // Full-bleed dark square; the mark sits well inside the 80% maskable safe zone
    maskable: { ...minimal2023Preset.maskable, sizes: [512], padding: 0.12, resizeOptions: { background: BRAND_DARK } },
    // iOS: no transparency, dark background
    apple: { ...minimal2023Preset.apple, sizes: [180], padding: 0.12, resizeOptions: { background: BRAND_DARK } },
  },
  images: ['public/icons/icon-512.png'],
});
