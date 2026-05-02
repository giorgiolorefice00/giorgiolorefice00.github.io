import { useState } from 'react';

interface Props {
  trackUrl: string;
  trackTitle: string;
}

export default function MixPlayer({ trackUrl, trackTitle }: Props) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23C8102E&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_playcount=false`;

  if (playing) {
    return (
      <iframe
        src={embedUrl}
        width="100%"
        height="120"
        frameBorder="0"
        scrolling="no"
        allow="autoplay"
        title={`SoundCloud player for ${trackTitle}`}
        style={{ border: 'none', display: 'block' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="btn-secondary"
      style={{ padding: '8px 16px', fontSize: '9px', width: '100%', letterSpacing: '0.14em' }}
    >
      <span>▶ LISTEN</span>
    </button>
  );
}
