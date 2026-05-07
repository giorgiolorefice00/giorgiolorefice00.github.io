// Mercator projection matching world-map.svg (scale=128, translate=[400,240], viewBox 800x480)
const SCALE = 128;
const CX = 400;
const CY = 240;

export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const lambda = (lng * Math.PI) / 180;
  const phi    = (lat * Math.PI) / 180;
  return {
    x: SCALE * lambda + CX,
    y: -SCALE * Math.log(Math.tan(Math.PI / 4 + phi / 2)) + CY,
  };
}

export function isVisible({ x, y }: { x: number; y: number }): boolean {
  return x >= 0 && x <= 800 && y >= 0 && y <= 480;
}
