import { useEffect } from 'react';
import { Minimize2 } from 'lucide-react';
import OledFace from '@/components/pet/OledFace';
import SpeechBubble from '@/components/pet/SpeechBubble';
import { MOOD_COPY } from '@/lib/petEngine';
import { usePet } from '@/lib/PetContext';

export default function FullscreenPet() {
  const { pet, mood, expression, idle, speaking, caption, bursts, petFace, setMode, notice } = usePet();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMode('dock');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode]);

  const exit = () => {
    try {
      const done = document.exitFullscreen?.();
      if (done && done.catch) done.catch(() => {});
    } catch {
      /* ignore */
    }
    setMode('dock');
  };

  return (
    <div
      onClick={petFace}
      className="fixed inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center bg-[#010203]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0,225,255,0.09), transparent 55%), radial-gradient(circle at 50% 120%, rgba(60,90,255,0.09), transparent 60%)',
        }}
      />

      <div className="relative w-[min(74vw,62vh)]">
        <OledFace expression={expression} idle={idle} speaking={speaking} bursts={bursts} />
      </div>

      <p className="relative mt-10 text-lg uppercase tracking-[0.4em] text-white/50">{pet.name}</p>
      <p className="relative mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/25">
        {notice ? notice.text : MOOD_COPY[mood] || 'here with you'}
      </p>

      <div className="relative mt-6 w-[min(80vw,420px)]">
        <SpeechBubble caption={caption} speaking={speaking} />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
        className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 transition hover:border-white/25 hover:text-white"
      >
        <Minimize2 className="h-3 w-3" strokeWidth={1.8} />
        Exit
      </button>

      <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.28em] text-white/15">
        tap anywhere to pet
      </p>
    </div>
  );
}