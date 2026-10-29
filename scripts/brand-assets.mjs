// Builds brand assets from public/icons that the PWA assets generator doesn't cover:
//  - favicon.svg (vector redraw of the mark) and favicon-32x32.png
//  - transparent wordmarks for light and dark UI, keyed out of climex-wordmark-on-dark.png
// Run: node scripts/brand-assets.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const DIR = 'public/icons';
const BG = [20, 20, 19]; // tile / wordmark background
const IVORY = [242, 238, 230];
const CLAY = [217, 119, 87];
const INK = [26, 25, 21]; // --ink in light mode

// 1. Vector favicon: two S-shaped ribbons on the rounded dark tile
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#141413"/>
  <path d="M96 143C236 143 276 366 416 366" fill="none" stroke="#D97757" stroke-width="56"/>
  <path d="M96 366C236 366 276 143 416 143" fill="none" stroke="#F2EEE6" stroke-width="56"/>
</svg>
`;
writeFileSync(`${DIR}/favicon.svg`, svg);
await sharp(Buffer.from(svg)).resize(32, 32).png().toFile(`${DIR}/favicon-32x32.png`);

// 2. Wordmarks: alpha = distance from the background colour, colour = nearest brand colour
const { data, info } = await sharp(`${DIR}/climex-wordmark-on-dark.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const fullIvory = dist(IVORY, BG);
const fullClay = dist(CLAY, BG);

function keyed(letterColour) {
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const px = [data[i], data[i + 1], data[i + 2]];
    const isClay = px[0] - px[2] > 40; // warm pixels belong to the X
    const target = isClay ? CLAY : IVORY;
    const alpha = Math.max(0, Math.min(1, dist(px, BG) / (isClay ? fullClay : fullIvory)));
    const colour = isClay ? CLAY : letterColour;
    out[i] = colour[0];
    out[i + 1] = colour[1];
    out[i + 2] = colour[2];
    out[i + 3] = Math.round(alpha * 255);
    void target;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 });
}

await keyed(INK).png().toFile(`${DIR}/climex-wordmark-light.png`);
await keyed(IVORY).png().toFile(`${DIR}/climex-wordmark-dark.png`);

const meta = await sharp(`${DIR}/climex-wordmark-light.png`).metadata();
console.log(`wordmarks ${meta.width}x${meta.height}, favicon.svg + favicon-32x32.png written`);
