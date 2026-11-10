import { TRACKS, embedUrl, openUrl } from '@/lib/tracks';

export default function SingPanel({ track, onNext, onStop }) {
  const index = TRACKS.findIndex((t) => t.id === track.id) + 1;

  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
          now singing · track {index}/5
        </span>
        <button
          type="button"
          onClick={onStop}
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
        >
          Stop
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <iframe
          title="Spotify player"
          src={embedUrl(track.id)}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: 0, display: 'block' }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/55 transition hover:border-cyan-300/40 hover:text-white"
        >
          Next song
        </button>
        <a
          href={openUrl(track.id)}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 transition hover:text-[#9CF6FF]"
        >
          Open in Spotify
        </a>
      </div>
    </div>
  );
}