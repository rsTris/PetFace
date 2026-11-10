import { useState } from 'react';
import { MOOD_COPY, ageLabel } from '@/lib/petEngine';
import { usePet } from '@/lib/PetContext';

export default function PetIdent() {
  const { pet, mood, notice, rename } = usePet();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pet.name);

  const commit = () => {
    rename(draft);
    setEditing(false);
  };

  return (
    <div className="mt-9 flex flex-col items-center">
      {editing ? (
        <input
          autoFocus
          value={draft}
          maxLength={12}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="w-48 border-b border-cyan-300/40 bg-transparent pb-1 text-center text-2xl uppercase tracking-[0.32em] text-white outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(pet.name);
            setEditing(true);
          }}
          className="text-2xl uppercase tracking-[0.32em] text-white/90 transition hover:text-white"
          title="Rename"
        >
          {pet.name}
        </button>
      )}

      <p
        className={`mt-3 h-4 font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
          notice ? 'text-white/85' : 'text-[#9CF6FF]/70'
        }`}
      >
        {notice ? notice.text : MOOD_COPY[mood] || 'here with you'}
      </p>

      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/20">
        {ageLabel(pet.born)} · {pet.pats} pats
      </p>
    </div>
  );
}