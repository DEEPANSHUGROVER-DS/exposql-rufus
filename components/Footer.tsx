import Link from "next/link";
import { Logo } from "./Logo";

const contactEmail = "hello@exposql.com";

export function Footer() {
  return (
    <footer className="relative border-t border-ink-900/[0.08] py-12">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              The AI workspace for the documents that win and close business.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <Link href="/proposals" className="text-ink-500 transition-colors hover:text-ink-900">Proposals & SOWs</Link>
            <Link href="/rfp" className="text-ink-500 transition-colors hover:text-ink-900">RFP & questionnaires</Link>
            <Link href="/contracts" className="text-ink-500 transition-colors hover:text-ink-900">Contract review</Link>
            <Link href="/pricing" className="text-ink-500 transition-colors hover:text-ink-900">Pricing</Link>
            <a href={`mailto:${contactEmail}`} className="text-ink-500 transition-colors hover:text-ink-900">{contactEmail}</a>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-900/[0.06] pt-6 text-xs text-ink-400 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} Rufus.</span>
            <Link href="/privacy" className="transition-colors hover:text-ink-900">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-ink-900">Terms</Link>
          </div>
          <a href="https://exposql.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink-900">
            An ExpoSQL AI Labs product →
          </a>
        </div>
      </div>
    </footer>
  );
}
