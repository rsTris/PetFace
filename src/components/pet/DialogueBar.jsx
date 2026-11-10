import { useState } from 'react';
import { Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { CONTEXTS } from '@/lib/dialogue';
import { usePet } from '@/lib/PetContext';

export default function DialogueBar() {
  const { voice, toggleVoice, context, setContext, lineTotal, grow } = usePet();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const learn = async () => {
    setBusy(true);
    try {
      const added = await grow();
      setNote(added > 0 ? `+${added} new lines` : 'nothing new this time');
    } catch {
      setNote('could not reach him right now');
    } finally {
      setBusy(false);
      setTimeout(() => setNote(''), 4200);
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
          he can hear what you're up to
        </span>
        <button
          type="button"
          onClick={toggleVoice}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] transition ${
            voice
              ? 'border-cyan-300/35 bg-cyan-300/[0.07] text-[#9CF6FF]'
              : 'border-white/10 text-white/35 hover:text-white/70'
          }`}
        >
          {voice ? <Volume2 className="h-3 w-3" strokeWidth={1.8} /> : <VolumeX className="h-3 w-3" strokeWidth={1.8} />}
          {voice ? 'Bleeps' : 'Silent'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CONTEXTS.map(({ key, label }) => {
          const active = context === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setContext(active ? '' : key)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition ${
                active
                  ? 'border-cyan-300/45 bg-cyan-300/[0.09] text-white'
                  : 'border-white/[0.08] text-white/40 hover:border-cyan-300/25 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
          {lineTotal.toLocaleString()} lines · captions always on
        </span>
        <button
          type="button"
          onClick={learn}
          disabled={busy}
          className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 transition hover:text-[#9CF6FF] disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.8} />
          ) : (
            <Sparkles className="h-3 w-3" strokeWidth={1.8} />
          )}
          {note || 'teach him new words'}
        </button>
      </div>

      <p className="mt-2 font-mono text-[8px] leading-relaxed tracking-[0.12em] text-white/15">
        browsers can't see your other apps — pick one above and he'll play along
      </p>
    </div>
  );
}