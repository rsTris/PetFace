import { Utensils, Gamepad2, Moon, Code2, Music2 } from 'lucide-react';
import { usePet } from '@/lib/PetContext';

const ACTIONS = [
  { key: 'feed', label: 'Feed', icon: Utensils },
  { key: 'play', label: 'Play', icon: Gamepad2 },
  { key: 'rest', label: 'Rest', icon: Moon },
  { key: 'code', label: 'Code', icon: Code2 },
  { key: 'sing', label: 'Sing', icon: Music2 },
];

export default function ActionBar() {
  const { activity, progress, startActivity } = usePet();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {ACTIONS.map(({ key, label, icon: Icon }) => {
        const active = activity?.type === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => startActivity(key)}
            className={`group relative min-w-[86px] flex-1 overflow-hidden rounded-full border px-3.5 py-3 transition-all duration-300 ${
              active
                ? 'border-cyan-300/45 bg-cyan-300/[0.07] text-white'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:text-white active:translate-y-0'
            }`}
          >
            {active && (
              <span
                className="absolute inset-y-0 left-0 bg-cyan-300/[0.13] transition-all duration-500 ease-linear"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${active ? 'text-[#9CF6FF]' : 'group-hover:text-[#9CF6FF]'}`}
                strokeWidth={1.7}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
            </span>
            {active && (
              <span className="absolute bottom-1.5 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-[#9CF6FF]/70" />
            )}
          </button>
        );
      })}
    </div>
  );
}