import Link from "next/link";
import { ArrowUpRight, ArrowRight, FileText, ListChecks, ShieldAlert, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Showcase } from "@/components/Showcase";
import { TaskMarquee } from "@/components/Marquee";
import { CountUp } from "@/components/CountUp";
import { Faq } from "@/components/Faq";
import { CTA } from "@/components/CTA";
import { ProposalMock, RfpMock, ContractMock } from "@/components/mocks";
import { tools, homeSteps, homeFaqs } from "@/lib/content";

const mockByKey = {
  proposals: ProposalMock,
  rfp: RfpMock,
  contracts: ContractMock,
} as const;

const iconByKey = {
  proposals: FileText,
  rfp: ListChecks,
  contracts: ShieldAlert,
} as const;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 pb-12 pt-36 sm:px-8 sm:pt-44">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="eyebrow">Rufus — by ExpoSQL AI Labs</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-[-0.02em] sm:text-5xl md:text-[3.6rem]">
              Win the work, then <span className="accent-italic text-accent">close it</span> — your document AI.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
              Rufus drafts branded proposals, answers RFPs and security questionnaires from your own
              knowledge base, and flags risky contract clauses in plain English. The slow, manual work,
              off your plate.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="btn-dark">
                Start free <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/proposals" className="btn-soft">
                See how it works
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-400">Free signup · pay only when you generate, from $15</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-silk-lav" /> Proposals & SOWs
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-silk-sky" /> RFP autopilot
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-silk-peach" /> Contract review
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Showcase />
          </Reveal>
        </div>
      </section>

      {/* Tasks marquee */}
      <section className="py-8">
        <div className="container-x">
          <Reveal>
            <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-ink-400">
              Everything Rufus takes off your plate
            </p>
          </Reveal>
          <TaskMarquee />
        </div>
      </section>

      {/* Three-tool overview */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Three tools, one workspace</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]">
              The documents that <span className="accent-italic text-accent">win and close</span> business.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tools.map((t, i) => {
              const Mock = mockByKey[t.key];
              const Icon = iconByKey[t.key];
              return (
                <Reveal key={t.key} delay={i * 0.1}>
                  <Link
                    href={t.href}
                    className="card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="shimmer-sweep" />
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full ${t.accent}/35 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <span aria-hidden className="pointer-events-none absolute right-5 top-5 animate-float text-ink-400/40 group-hover:text-accent/70">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="relative flex items-center gap-3">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-2xl ${t.accent}/40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-5 w-5 text-ink-900" />
                      </span>
                      <span className="text-xs font-medium text-ink-400">{t.audience}</span>
                    </div>
                    <h3 className="relative mt-5 text-xl font-semibold tracking-[-0.01em] text-ink-900">
                      {t.name}
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{t.blurb}</p>
                    <div className="relative mt-6 rounded-2xl border border-ink-900/[0.05] bg-paper-50/60 p-4 transition-colors duration-500 group-hover:bg-paper-50/90">
                      <Mock />
                    </div>
                    <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                      Explore{" "}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Set it up once, <span className="accent-italic text-accent">move fast</span> forever.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {homeSteps.map((s, i) => (
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

      {/* Comparison / count-up */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden p-8 sm:p-12">
              <span className="shimmer-sweep" />
              <div className="relative grid gap-10 sm:grid-cols-3">
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-5xl">
                    <CountUp to={6} suffix=" wks" /> <span className="text-ink-400">→</span>{" "}
                    <span className="accent-italic text-accent">1 day</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    From a blank page to a sent proposal. Rufus does the first pass in seconds.
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-5xl">
                    <CountUp to={120} suffix="+" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    Questionnaire items answered from your knowledge base in a single pass.
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-5xl">
                    <CountUp to={100} suffix="%" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    Sourced answers. Rufus never invents facts — it flags what it can&apos;t back up.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <div className="flex justify-center">
              <p className="eyebrow">Questions</p>
            </div>
            <h2 className="mt-4 text-center text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              The <span className="accent-italic text-accent">basics</span>.
            </h2>
          </Reveal>
          <div className="mt-12">
            <Faq items={homeFaqs} />
          </div>
        </div>
      </section>

      <CTA
        title="Win the work, then close it."
        sub="Set up your workspace in minutes and let Rufus take the first pass on every document."
        secondary={{ label: "Explore the tools", href: "/proposals" }}
      />
    </>
  );
}
