import { useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import OledFace from '@/components/pet/OledFace';
import SpeechBubble from '@/components/pet/SpeechBubble';
import { POS_KEY } from '@/lib/petEngine';
import { usePet } from '@/lib/PetContext';

const SIZE = 176;
const PAD = 10;

const clampPos = ({ x, y }) => {
  const maxX = Math.max(PAD, window.innerWidth - SIZE - PAD);
  const maxY = Math.max(PAD, window.innerHeight - SIZE - 60);
  return {
    x: Math.min(Math.max(PAD, x), maxX),
    y: Math.min(Math.max(PAD, y), maxY),
  };
};

const readPos = () => {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return clampPos(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return clampPos({ x: window.innerWidth - SIZE - 28, y: window.innerHeight - SIZE - 96 });
};

export default function FloatingPet() {
  const { pet, expression, idle, speaking, caption, bursts, petFace, dizzy, setMode } = usePet();
  const [pos, setPos] = useState(readPos);
  const dragRef = useRef(null);
  const shake = useRef([]);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {
      /* ignore */
    }
  }, [pos]);

  const startDrag = (e) => {
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, lx: e.clientX, ly: e.clientY, lt: performance.now() };

    const move = (ev) => {
      const drag = dragRef.current;
      if (!drag) return;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lt);
      const speed = Math.hypot(ev.clientX - drag.lx, ev.clientY - drag.ly) / dt;

      if (speed > 1.7) {
        shake.current = [...shake.current.filter((t) => now - t < 900), now];
        if (shake.current.length >= 4) {
          shake.current = [];
          dizzy();
        }
      }
      drag.lx = ev.clientX;
      drag.ly = ev.clientY;
      drag.lt = now;
      setPos(clampPos({ x: ev.clientX - drag.dx, y: ev.clientY - drag.dy }));
    };

    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="fixed z-[70] select-none" style={{ left: pos.x, top: pos.y, width: SIZE }}>
      <div className="rounded-[30px] border border-white/[0.09] bg-[#05070a]/80 p-2.5 shadow-[0_36px_70px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <div
          onPointerDown={startDrag}
          className="group flex cursor-grab items-center justify-between px-1.5 pb-1.5 active:cursor-grabbing"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.26em] text-white/25">
            {pet.name}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setMode('full')}
              aria-label="Open full screen"
              className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-3 w-3" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => setMode('dock')}
              aria-label="Close floating pet"
              className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-3 w-3" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <OledFace expression={expression} idle={idle} speaking={speaking} onPet={petFace} bursts={bursts} />

        <div className="mt-1">
          <SpeechBubble caption={caption} speaking={speaking} compact />
        </div>
      </div>
    </div>
  );
}