import { useState, useEffect } from "react";

interface LightboxState {
  youtubeId?: string;
  vimeoId?: string;
  title?: string;
}

export default function VideoLightbox() {
  const [open, setOpen] = useState<LightboxState | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LightboxState>).detail;
      if (detail.youtubeId || detail.vimeoId) setOpen(detail);
    };
    document.addEventListener("openLightbox", handler);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("openLightbox", handler);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  const src = open.youtubeId
    ? `https://www.youtube.com/embed/${open.youtubeId}?autoplay=1`
    : open.vimeoId
    ? `https://player.vimeo.com/video/${open.vimeoId}?autoplay=1`
    : null;

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
    >
      <button className="lightbox-close" onClick={() => setOpen(null)} style={{ top: 16, right: 16, fontSize: 11 }}>[ ESC / CLOSE ]</button>
      <div style={{ width: "min(900px,96vw)", position: "relative" }}>
        {src ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={src}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid #c8102e" }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{ padding: "48px", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", color: "#6b6b6b", fontSize: 11, letterSpacing: "0.1em", border: "1px solid #c8102e" }}>
            no embed available — placeholder content
          </div>
        )}
        {open.title && (
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#6b6b6b", letterSpacing: "0.1em", marginTop: 12 }}>
            {open.title}
          </div>
        )}
      </div>
    </div>
  );
}
