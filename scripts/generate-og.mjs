/**
 * Generates public/og-image.jpg — 1200×630 OG/Twitter card image.
 * Uses sharp (bundled with Astro) so no extra install needed.
 * Run manually: node scripts/generate-og.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const out   = join(__dir, "../public/og-image.jpg");

// SVG drawn with system fonts — no external font dependency
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Black background -->
  <rect width="1200" height="630" fill="#000000"/>

  <!-- Subtle noise overlay -->
  <filter id="n" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
  <rect width="1200" height="630" filter="url(#n)" opacity="0.04"/>

  <!-- Blood red vertical accent -->
  <rect x="80" y="160" width="3" height="310" fill="#C8102E"/>

  <!-- GIORGIO — blood red -->
  <text
    x="110" y="310"
    font-family="Impact, Arial Black, 'Arial Narrow', sans-serif"
    font-weight="900"
    font-size="148"
    fill="#C8102E"
    letter-spacing="-3"
  >GIORGIO</text>

  <!-- LOREFICE — bone white -->
  <text
    x="110" y="440"
    font-family="Impact, Arial Black, 'Arial Narrow', sans-serif"
    font-weight="900"
    font-size="148"
    fill="#E8E8E8"
    letter-spacing="-3"
  >LOREFICE</text>

  <!-- Mono subtitle -->
  <text
    x="113" y="495"
    font-family="'Courier New', Courier, monospace"
    font-size="20"
    fill="#6B6B6B"
    letter-spacing="5"
  >underground techno · milano · since 2013</text>

  <!-- 1px red horizontal rule -->
  <rect x="80" y="520" width="1040" height="1" fill="#C8102E" opacity="0.4"/>

  <!-- URL bottom-right -->
  <text
    x="1120" y="575"
    font-family="'Courier New', Courier, monospace"
    font-size="18"
    fill="#6B6B6B"
    text-anchor="end"
    letter-spacing="2"
  >giorgiolorefice.com</text>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

const kb = Math.round(writeFileSync(out, await sharp(buf).jpeg({ quality: 82 }).toBuffer()) || 0);
console.log(`✓ og-image.jpg written to public/`);
