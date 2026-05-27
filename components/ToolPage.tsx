import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { Faq } from "./Faq";
import { CTA } from "./CTA";

interface ToolContent {
  hero: {
    eyebrow: string;
    audience: string;
    title: string;
    accent: string;
    rest: string;
    sub: string;
  };
  features: { title: string; body: string }[];
  steps: { n: string; title: string; body: string }[];
  pricing: { headline: string; body: string };
  faqs: { q: string; a: string }[];
}

export function ToolPage({ content, demo }: { content: ToolContent; demo: ReactNode }) {
  const { hero } = content;
  return (
    <>
      {/* Hero */}
      <section className="px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="chip">{hero.audience}</span>
            <p className="eyebrow mt-5">{hero.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.4rem]">
              {hero.title} <span className="accent-italic text-accent">{hero.accent}</span>
              {hero.rest}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-500">{hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-dark">
                Get started <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-soft">
                See pricing
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>{demo}</Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">What it does</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Everything you need, <span className="accent-italic text-accent">nothing</span> you don&apos;t.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {content.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="card relative h-full overflow-hidden p-7 transition-shadow duration-300 hover:shadow-lift">
                  <span className="shimmer-sweep" />
                  <div className="relative">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-paper-50">
                      <Check className="h-4 w-4" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-ink-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Three steps, <span className="accent-italic text-accent">start to send</span>.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {content.steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="card h-full p-7">
                  <span className="font-serif text-3xl italic text-accent">{s.n}</span>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mini pricing */}
      <section className="py-12">
        <div className="container-x">
          <Reveal>
            <div className="card relative flex flex-col items-start justify-between gap-6 overflow-hidden p-8 sm:flex-row sm:items-center sm:p-10">
              <span className="shimmer-sweep" />
              <div className="relative">
                <p className="eyebrow">Pricing</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{content.pricing.headline}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{content.pricing.body}</p>
              </div>
              <Link href="/pricing" className="btn-dark relative shrink-0">
                View plans <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <div className="flex justify-center"><p className="eyebrow">Questions</p></div>
            <h2 className="mt-4 text-center text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Good to <span className="accent-italic text-accent">know</span>.
            </h2>
          </Reveal>
          <div className="mt-12">
            <Faq items={content.faqs} />
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
