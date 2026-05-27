"use client";

const bars = [0.4, 0.8, 0.55, 1, 0.7, 0.35, 0.9, 0.5, 0.75, 0.45, 0.85, 0.6];

export function Waveform({ label = "Drafting…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-full border border-ink-900/[0.08] bg-white/90 px-4 py-2.5 shadow-soft backdrop-blur ${className}`}>
      <div className="flex h-5 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] origin-center rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq"
            style={{ height: `${h * 100}%`, animationDuration: `${0.9 + (i % 4) * 0.18}s`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-700">{label}</span>
    </div>
  );
}
