import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Rufus home">
      <span className="relative grid h-8 w-8 place-items-center">
        <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" aria-hidden>
          <defs>
            <linearGradient id="rfx" x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#A9B8FF" />
              <stop offset="0.5" stopColor="#C7B8F5" />
              <stop offset="1" stopColor="#FFC4D6" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="12" fill="url(#rfx)" />
          <path d="M14 28V13h7a5 5 0 0 1 0 10h-7m7 0 5 5" stroke="#1B1A16" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold leading-none tracking-tight text-ink-900">
        Rufus
        <span className="ml-1 font-medium text-ink-400">by ExpoSQL</span>
      </span>
    </Link>
  );
}
