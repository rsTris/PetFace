const LINES = [
  '$ momo run ./feelings.js',
  'import { you } from "life";',
  'while (awake) { wag(); blink(); }',
  'if (you.sad) await hug(you, 3);',
  '// TODO: stop overthinking',
  'function nap(n) { return n * 2; }',
  'git commit -m "feeling cute today"',
  '✓ 8 passed · 0 errors · 2 naps',
];

export default function CodePanel({ progress }) {
  const visible = Math.max(1, Math.ceil((progress / 100) * LINES.length));

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#05090c]/85 backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
          momo@pet ~ /feelings
        </span>
      </div>
      <div className="space-y-1 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-[#9CF6FF]/75">
        {LINES.slice(0, visible).map((line, i) => (
          <p key={i} className={line.startsWith('$') ? 'text-white/65' : ''}>
            {line}
          </p>
        ))}
        <span className="inline-block h-3 w-1.5 animate-pulse bg-[#9CF6FF]" />
      </div>
    </div>
  );
}