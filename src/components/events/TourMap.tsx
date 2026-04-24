import { useState } from "react";

interface MapDot {
  cx: number;
  cy: number;
  label: string;
  upcoming: boolean;
  tip: string;
}

// Pre-calculated SVG coords (viewBox 0 0 900 440) matching the design
const MAP_DOTS: MapDot[] = [
  { cx: 480, cy: 130, label: "berlin",      upcoming: true,  tip: "Berghain — 27 APR" },
  { cx: 455, cy: 118, label: "london",      upcoming: true,  tip: "Fabric — 24 MAY" },
  { cx: 478, cy: 148, label: "paris",       upcoming: true,  tip: "Rex Club — 07 JUN" },
  { cx: 472, cy: 104, label: "amsterdam",   upcoming: true,  tip: "Awakenings — 20 JUN" },
  { cx: 493, cy: 122, label: "milan",       upcoming: false, tip: "Boiler Room — 09.2025" },
  { cx: 625, cy: 128, label: "moscow",      upcoming: false, tip: "Tour — 04.2025" },
  { cx: 300, cy: 136, label: "new york",    upcoming: false, tip: "Output — 11.2024" },
  { cx: 252, cy: 158, label: "mexico city", upcoming: false, tip: "Tresor MX — 01.2025" },
  { cx: 195, cy: 198, label: "são paulo",   upcoming: false, tip: "D-Edge — 08.2024" },
  { cx: 718, cy: 178, label: "tokyo",       upcoming: false, tip: "Womb — 02.2025" },
];

// Simplified world SVG path data (Natural Earth simplified)
const WORLD_PATH = `M 72 156 L 84 148 L 92 140 L 100 136 L 112 128 L 128 124 L 140 120 L 152 116 L 164 112 L 176 108 L 188 108 L 200 108 L 212 112 L 220 116 L 228 124 L 232 132 L 236 140 L 240 148 L 244 160 L 248 172 L 248 184 L 244 192 L 240 196 L 236 200 L 228 204 L 220 208 L 212 212 L 204 216 L 196 216 L 188 212 L 180 208 L 172 204 L 164 200 L 156 196 L 148 196 L 140 200 L 132 200 L 124 196 L 116 192 L 108 188 L 100 184 L 92 176 L 80 168 Z M 256 136 L 264 128 L 272 124 L 284 120 L 296 116 L 308 116 L 320 120 L 328 124 L 336 128 L 340 136 L 344 144 L 344 152 L 340 160 L 336 164 L 328 168 L 320 172 L 308 176 L 296 176 L 284 172 L 276 168 L 268 164 L 260 156 L 256 148 Z M 356 96 L 368 88 L 380 84 L 392 80 L 404 76 L 420 72 L 436 68 L 452 64 L 468 64 L 484 68 L 500 72 L 512 80 L 520 88 L 524 96 L 528 108 L 532 120 L 536 132 L 540 144 L 540 156 L 536 164 L 528 172 L 520 176 L 512 180 L 500 180 L 488 176 L 476 172 L 464 168 L 452 164 L 440 164 L 428 168 L 420 172 L 408 172 L 396 168 L 384 164 L 376 156 L 368 148 L 360 140 L 356 128 L 352 116 Z M 548 80 L 560 76 L 576 72 L 596 68 L 616 68 L 636 72 L 652 76 L 664 84 L 672 96 L 676 108 L 676 124 L 672 136 L 664 148 L 652 156 L 636 164 L 620 168 L 604 172 L 588 172 L 572 168 L 560 160 L 552 148 L 548 136 L 544 120 L 544 104 Z M 684 84 L 700 80 L 716 80 L 736 84 L 756 88 L 772 96 L 784 108 L 792 120 L 796 136 L 796 152 L 792 164 L 784 176 L 772 184 L 756 192 L 740 196 L 720 200 L 700 200 L 684 196 L 672 188 L 664 176 L 660 160 L 660 144 L 664 128 L 672 116 L 680 104 Z M 180 228 L 196 224 L 212 224 L 228 228 L 240 236 L 248 248 L 252 264 L 252 280 L 248 296 L 240 308 L 228 316 L 212 320 L 196 320 L 180 316 L 168 308 L 160 296 L 156 280 L 156 264 L 160 248 L 168 236 Z M 440 216 L 456 212 L 472 212 L 488 216 L 500 224 L 508 236 L 512 252 L 512 272 L 508 292 L 500 308 L 488 320 L 472 328 L 456 332 L 440 332 L 424 328 L 412 320 L 404 308 L 400 292 L 400 272 L 404 252 L 412 240 L 424 228 Z M 76 336 L 88 332 L 100 332 L 112 336 L 120 348 L 124 364 L 124 380 L 120 396 L 112 408 L 100 416 L 88 416 L 76 412 L 68 400 L 64 384 L 64 368 L 68 352 Z`;

export default function TourMap() {
  const [tooltip, setTooltip] = useState<{ dot: MapDot; x: number; y: number } | null>(null);

  return (
    <section style={{ background: "#0a0a0a", padding: "100px 72px" }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#c8102e", letterSpacing: "0.22em", marginBottom: 48, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 20, height: 1, background: "#c8102e", display: "inline-block" }} />
        B — on the road
      </div>

      <div className="tour-map-wrap" style={{ position: "relative", width: "100%", maxWidth: 900 }}>
        <svg
          viewBox="0 0 900 440"
          style={{ width: "100%", display: "block", background: "#050505", border: "1px solid #1a1a1a" }}
          aria-label="Tour map"
        >
          {/* World outline */}
          <path d={WORLD_PATH} fill="#0d0d0d" stroke="#1a1a1a" strokeWidth="1" />

          {/* Dots */}
          {MAP_DOTS.map((dot) => (
            <g key={dot.label} style={{ cursor: "pointer" }} onClick={() => {
              setTooltip(tooltip?.dot === dot ? null : { dot, x: dot.cx, y: dot.cy });
            }}>
              {dot.upcoming ? (
                <>
                  <circle cx={dot.cx} cy={dot.cy} r="8" fill="#c8102e" opacity="0.15">
                    <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.02;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={dot.cx} cy={dot.cy} r="4" fill="#c8102e" />
                </>
              ) : (
                <circle cx={dot.cx} cy={dot.cy} r="3.5" fill="#c8102e" opacity="0.4" />
              )}
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(tooltip.dot.cx + 12, 760);
            const ty = Math.max(tooltip.dot.cy - 36, 8);
            return (
              <g>
                <rect x={tx} y={ty} width="160" height="28" fill="#000" stroke="#c8102e" strokeWidth="1" />
                <text x={tx + 8} y={ty + 11} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#c8102e" letterSpacing="0.1em">{tooltip.dot.label.toUpperCase()}</text>
                <text x={tx + 8} y={ty + 22} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#e8e8e8">{tooltip.dot.tip}</text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16"><circle cx="8" cy="8" r="4" fill="#c8102e" /></svg>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#6b6b6b", letterSpacing: "0.14em" }}>upcoming (pulsing)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16"><circle cx="8" cy="8" r="3.5" fill="#c8102e" opacity="0.4" /></svg>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#6b6b6b", letterSpacing: "0.14em" }}>past (solid)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
