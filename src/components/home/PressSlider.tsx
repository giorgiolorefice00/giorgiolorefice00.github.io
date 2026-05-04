import { useState, useEffect, useRef } from "react";

interface Quote {
  text: string;
  pub: string;
  attr: string;
}

interface Props {
  quotes: Quote[];
  eyebrow: string;
  heading1: string;
  heading2: string;
  prevLabel: string;
  nextLabel: string;
}

export default function PressSlider({ quotes, eyebrow, heading1, heading2, prevLabel, nextLabel }: Props) {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    setActive(idx);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % quotes.length);
      setAnimKey((k) => k + 1);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, quotes.length]);

  if (quotes.length === 0) return null;
  const q = quotes[active]!;

  return (
    <section
      style={{ background: "#0a0a0a", padding: "120px 72px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#c8102e", letterSpacing: "0.22em", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ width: 20, height: 1, background: "#c8102e", display: "inline-block" }} />
          {eyebrow}
          <span style={{ width: 20, height: 1, background: "#c8102e", display: "inline-block" }} />
        </div>
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(36px,4vw,64px)", lineHeight: 1 }}>
          <span style={{ color: "#e8e8e8" }}>{heading1}</span><br />
          <span style={{ color: "#c8102e" }}>{heading2}</span>
        </div>
      </div>

      {/* QUOTE */}
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <span className="quote-mark">"</span>
        <div key={animKey} className="quote-fade-enter" style={{ paddingLeft: 80, paddingTop: 60 }}>
          <p className="quote-text">"{q.text}"</p>
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#e8e8e8", letterSpacing: "0.18em" }}>{q.pub}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#6b6b6b", letterSpacing: "0.1em" }}>{q.attr}</span>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 64 }}>
        <button className="slider-nav" onClick={() => goTo((active - 1 + quotes.length) % quotes.length)}>{prevLabel}</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {quotes.map((_, i) => (
            <div key={i} className={`slider-dot${i === active ? " active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="slider-nav" onClick={() => goTo((active + 1) % quotes.length)}>{nextLabel}</button>
      </div>
    </section>
  );
}
