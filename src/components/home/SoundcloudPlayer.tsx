import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { SC: any; }
}

interface SoundcloudPlayerProps {
  trackUrl: string;
  trackTitle?: string;
}

function generatePseudoWaveform(seed: string, count = 150): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 9301 + 49297) % 233280;
    const normalized = hash / 233280;
    const height = 0.2 + (normalized * 0.6) + (Math.sin(i * 0.3) * 0.15);
    bars.push(Math.max(0.1, Math.min(1, height)));
  }
  return bars;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SoundcloudPlayer({ trackUrl, trackTitle }: SoundcloudPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const bars = generatePseudoWaveform(trackUrl);
  const playedBars = duration > 0 ? Math.floor((currentTime / duration) * bars.length) : 0;

  useEffect(() => {
    function initWidget() {
      if (!iframeRef.current || !window.SC) return;
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.getDuration((d: number) => setDuration(d));
        setIsReady(true);
        setIsLoading(false);
      });
      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
        setCurrentTime(e.currentPosition);
      });
      widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    if (window.SC) {
      initWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    script.onload = initWidget;
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current && window.SC) {
        try { widgetRef.current.unbind(window.SC.Widget.Events.PLAY_PROGRESS); } catch {}
        try { widgetRef.current.unbind(window.SC.Widget.Events.READY); } catch {}
        try { widgetRef.current.unbind(window.SC.Widget.Events.PLAY); } catch {}
        try { widgetRef.current.unbind(window.SC.Widget.Events.PAUSE); } catch {}
        try { widgetRef.current.unbind(window.SC.Widget.Events.FINISH); } catch {}
      }
    };
  }, [trackUrl]);

  // Fallback if API doesn't load within 5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady) setLoadFailed(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isReady]);

  const handlePlayPause = () => {
    if (!isReady || !widgetRef.current) return;
    widgetRef.current.toggle();
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReady || !widgetRef.current || duration === 0 || !waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    widgetRef.current.seekTo(Math.max(0, Math.min(1, fraction)) * duration);
  };

  const handleWaveformKeyDown = (e: React.KeyboardEvent) => {
    if (!isReady || !widgetRef.current) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      widgetRef.current.seekTo(Math.max(0, currentTime - 5000));
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      widgetRef.current.seekTo(Math.min(duration, currentTime + 5000));
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      widgetRef.current.toggle();
    }
  };

  const iframeUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=false&hide_related=true&visual=false`;

  if (loadFailed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px' }}>
        <a
          href={trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: '#c8102e',
            letterSpacing: '0.18em',
            textDecoration: 'none',
            border: '1px solid #c8102e',
            padding: '12px 24px',
            display: 'inline-block',
          }}
        >
          → LISTEN ON SOUNDCLOUD
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Hidden iframe — must stay in DOM for Widget API to work */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        width="0"
        height="0"
        style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}
        allow="autoplay"
        title={trackTitle ? `Audio player for ${trackTitle}` : 'Audio player'}
      />

      {/* Custom player UI */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minHeight: '64px' }}>

        {/* Play / Pause button */}
        <button
          ref={btnRef}
          onClick={handlePlayPause}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!isReady}
          style={{
            width: '48px',
            height: '48px',
            flexShrink: 0,
            border: '1px solid #c8102e',
            background: btnHover && isReady ? '#c8102e' : 'transparent',
            cursor: isReady ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isReady ? 1 : 0.4,
            transition: 'background 0.15s',
            padding: 0,
          }}
        >
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill={btnHover ? '#000' : '#c8102e'}>
              <rect x="0" y="0" width="4" height="14" />
              <rect x="8" y="0" width="4" height="14" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill={btnHover ? '#000' : '#c8102e'}>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div
          ref={waveformRef}
          role="slider"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-label="Playback position — use arrow keys to seek"
          tabIndex={0}
          onClick={handleWaveformClick}
          onKeyDown={handleWaveformKeyDown}
          style={{
            flex: 1,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            gap: '1px',
            cursor: isReady ? 'pointer' : 'default',
            opacity: isLoading ? 0.3 : 1,
            transition: 'opacity 0.4s',
            outline: 'none',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: '2px',
                height: `${Math.round(h * 64)}px`,
                flexShrink: 0,
                background: i < playedBars ? '#c8102e' : 'rgba(232,232,232,0.25)',
                transition: i < playedBars + 2 && i > playedBars - 2 ? 'background 0.05s' : 'none',
              }}
            />
          ))}
        </div>

        {/* Time display */}
        <div style={{ flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#c8102e' }}>{formatTime(currentTime)}</span>
          <span style={{ color: '#333' }}> / </span>
          <span style={{ color: '#6b6b6b' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Loading label */}
      {isLoading && (
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          color: '#333',
          letterSpacing: '0.18em',
          marginTop: '6px',
        }}>
          loading…
        </div>
      )}
    </div>
  );
}
