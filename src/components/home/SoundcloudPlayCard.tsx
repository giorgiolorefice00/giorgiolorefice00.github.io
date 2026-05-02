import { useState } from 'react';

interface Props {
  trackUrl: string;
  trackTitle: string;
  duration: string;
  coverImage?: string;
}

export default function SoundcloudPlayCard({ trackUrl, trackTitle, duration, coverImage }: Props) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [fading, setFading] = useState(false);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23C8102E&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_playcount=false`;

  const handlePlay = () => {
    setFading(true);
    setTimeout(() => setHasPlayed(true), 200);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Always-present iframe — src is empty until played to avoid loading SC on initial page load */}
      <iframe
        src={hasPlayed ? embedUrl : ''}
        width="100%"
        height="166"
        frameBorder="0"
        scrolling="no"
        allow="autoplay"
        title={`SoundCloud player for ${trackTitle}`}
        aria-hidden={!hasPlayed}
        style={{
          display: hasPlayed ? 'block' : 'none',
          border: 'none',
        }}
      />

      {/* Play card — shown until user clicks */}
      {!hasPlayed && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play ${trackTitle}`}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'stretch',
            background: '#000',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
          className="sc-play-card"
        >
          {/* Cover art — 120px square, red right border, duotone filter */}
          <div style={{
            width: '120px',
            minWidth: '120px',
            height: '120px',
            flexShrink: 0,
            borderRight: '1px solid #c8102e',
            overflow: 'hidden',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {coverImage ? (
              <img
                src={coverImage}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duotone)' }}
              />
            ) : (
              /* Placeholder: geometric blood-red mark when no cover art */
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="0" y="0" width="40" height="40" fill="#0a0a0a"/>
                <path d="M8 8h8v24H8zM16 20l16-12v24z" fill="#c8102e"/>
              </svg>
            )}
          </div>

          {/* Center column */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '16px 24px',
            textAlign: 'left',
            minWidth: 0,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              color: '#c8102e',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              [ ▶ ready to play ]
            </div>
            <div style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(18px, 2.5vw, 32px)',
              color: '#e8e8e8',
              letterSpacing: '0.02em',
              lineHeight: 1,
              textTransform: 'uppercase',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {trackTitle}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#6b6b6b',
              letterSpacing: '0.14em',
            }}>
              {duration}
            </div>
          </div>

          {/* Play button */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
          }}>
            <div className="sc-play-btn" style={{
              width: '72px',
              height: '72px',
              border: '2px solid #c8102e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.15s, transform 0.15s',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#c8102e" style={{ marginLeft: '3px' }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </button>
      )}

      <style>{`
        .sc-play-card:hover .sc-play-btn {
          border-color: #ff1f1f;
          transform: scale(1.05);
        }
        .sc-play-card:focus-visible .sc-play-btn {
          outline: 2px solid #c8102e;
          outline-offset: 3px;
        }
        @media (max-width: 640px) {
          .sc-play-card > div:first-child {
            width: 80px !important;
            min-width: 80px !important;
            height: 80px !important;
          }
          .sc-play-card > div:nth-child(2) {
            padding: 10px 12px !important;
          }
          .sc-play-card > div:last-child {
            padding: 0 14px !important;
          }
          .sc-play-btn {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </div>
  );
}
