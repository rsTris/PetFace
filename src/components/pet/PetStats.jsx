const METERS = [
  { key: 'fullness', label: 'Fullness' },
  { key: 'energy', label: 'Energy' },
  { key: 'happiness', label: 'Joy' },
];

const toneFor = (value) => {
  if (value <= 25) return '#FF8E72';
  if (value <= 50) return '#FFD37A';
  return '#6FF3FF';
};

export default function PetStats({ pet }) {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 backdrop-blur-md sm:grid-cols-3">
      {METERS.map((meter) => {
        const value = Math.round(pet[meter.key]);
        const tone = toneFor(value);
        return (
          <div key={meter.key}>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
                {meter.label}
              </span>
              <span className="font-mono text-[11px] tabular-nums" style={{ color: tone }}>
                {value}
              </span>
            </div>
            <div className="relative mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${value}%`,
                  background: tone,
                  boxShadow: `0 0 10px ${tone}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}