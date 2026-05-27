export function SilkBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-paper" />
      <div className="silk-blob animate-silk-1 left-[-10%] top-[-5%] h-[42vw] w-[42vw] bg-silk-lav/45" />
      <div className="silk-blob animate-silk-2 right-[-8%] top-[20%] h-[38vw] w-[38vw] bg-silk-sky/40" />
      <div className="silk-blob animate-silk-3 bottom-[-10%] left-[25%] h-[40vw] w-[40vw] bg-silk-peach/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/40 to-paper" />
      <div className="grain absolute inset-0 opacity-[0.04] mix-blend-multiply" />
    </div>
  );
}

export function SilkRibbon({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none relative overflow-hidden ${className}`}>
      <div className="relative mx-auto h-full w-full">
        <div className="silk-blob animate-silk-1 left-[2%] top-[-30%] h-[120%] w-[42%] bg-silk-peri/80" />
        <div className="silk-blob animate-silk-2 left-[26%] top-[-10%] h-[120%] w-[40%] bg-silk-lav/80" />
        <div className="silk-blob animate-silk-3 left-[44%] top-[-25%] h-[120%] w-[42%] bg-silk-blush/75" />
        <div className="silk-blob animate-silk-2 left-[62%] top-[-5%] h-[120%] w-[40%] bg-silk-sky/75" />
        <div className="silk-blob animate-silk-1 left-[78%] top-[-20%] h-[120%] w-[38%] bg-silk-mint/70" />
        <div className="absolute inset-x-0 top-[18%] h-[24%] bg-white/30 blur-2xl" />
      </div>
    </div>
  );
}
