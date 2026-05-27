import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SilkRibbon } from "./Silk";
import { Reveal } from "./Reveal";

export function CTA({
  title = "Ready to win and close more, with less busywork?",
  sub = "Set up your workspace in minutes and let Rufus take the first pass on every document.",
  primary = { label: "Get started", href: "/pricing" },
  secondary = { label: "See how it works", href: "/" },
}: {
  title?: string;
  sub?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-ink-900/[0.08] bg-ink-900 px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20">
            <SilkRibbon className="absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-paper-50 sm:text-4xl md:text-[2.9rem]">
                {title}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-paper-200/80">{sub}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link href={primary.href} className="btn-soft">
                  {primary.label} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href={secondary.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-paper-200/90 transition-colors hover:text-paper-50"
                >
                  {secondary.label}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
