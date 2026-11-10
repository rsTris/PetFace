import { Maximize2, Layers, Volume2, VolumeX } from 'lucide-react';
import { usePet } from '@/lib/PetContext';

const btn =
  'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/55 transition hover:border-cyan-300/40 hover:text-white';

export default function PetTopBar() {
  const { setMode, pet, sound, toggleSound } = usePet();

  const goFull = () => {
    try {
      const req = document.documentElement.requestFullscreen?.();
      if (req && req.catch) req.catch(() => {});
    } catch {
      /* fullscreen not allowed here */
    }
    setMode('full');
  };

  return (
    <header className="relative z-10 flex items-center justify-between px-6 pt-7 sm:px-10">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7FEBFF] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7FEBFF]" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.46em] text-white/60">
          {pet.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={sound ? 'Mute sounds' : 'Unmute sounds'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-cyan-300/40 hover:text-white"
        >
          {sound ? <Volume2 className="h-3.5 w-3.5" strokeWidth={1.8} /> : <VolumeX className="h-3.5 w-3.5" strokeWidth={1.8} />}
        </button>
        <button type="button" onClick={() => setMode('float')} className={btn}>
          <Layers className="h-3 w-3" strokeWidth={1.8} />
          Float
        </button>
        <button type="button" onClick={goFull} className={btn}>
          <Maximize2 className="h-3 w-3" strokeWidth={1.8} />
          Full screen
        </button>
      </div>
    </header>
  );
}