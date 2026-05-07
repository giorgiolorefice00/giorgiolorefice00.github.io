import { geoMercator, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const worldAtlas = JSON.parse(readFileSync(
  resolve(__dirname, '../node_modules/world-atlas/countries-110m.json'), 'utf8'
));

// geoMercator with our target viewBox 800x480
const projection = geoMercator().scale(128).translate([400, 240]);
const pathGen = geoPath(projection);

// Land: one merged polygon for all landmasses (small file)
const land = feature(worldAtlas, worldAtlas.objects.land);
const landPath = pathGen(land);

// Country borders: mesh of shared borders only (interior borders)
const borders = mesh(worldAtlas, worldAtlas.objects.countries, (a, b) => a !== b);
const bordersPath = pathGen(borders);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
  <path class="land" d="${landPath}" />
  <path class="borders" d="${bordersPath}" />
</svg>`;

const outPath = resolve(__dirname, '../src/components/events/world-map.svg');
writeFileSync(outPath, svg);
const kb = Math.round(svg.length / 1024);
console.log(`Generated world-map.svg (${kb}KB raw)`);
