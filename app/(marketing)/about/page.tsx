import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CTA } from "@/components/CTA";

export const metadata: Metadata = {
  title: "About — an ExpoSQL AI Labs product",
  description:
    "Rufus is built by ExpoSQL AI Labs to take slow, manual document work off the plates of agencies, consultants, and B2B sales teams.",
};

const principles = [
  {
    t: "Genuinely useful, AI-forward",
    b: "We build products that take slow, manual work off your plate so your business can scale — not demos that look clever and stall.",
  },
  {
    t: "Honest by default",
    b: "Rufus never invents facts. RFP answers cite their source, and contract review is framed as for your review — never legal advice.",
  },
  {
    t: "Calm and premium",
    b: "The work is high-stakes; the tool should feel composed. Clean drafts, clear pricing, and exports that look like you.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="px-5 pb-12 pt-36 sm:px-8 sm:pt-44">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">About</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.2rem]">
              The AI workspace for the documents that{" "}
              <span className="accent-italic text-accent">win and close</span> business.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
              Rufus is a product by ExpoSQL AI Labs. We build AI that helps businesses move faster by
              handling the slow, repetitive document work — proposals, questionnaires, and contract
              review — so teams can spend their time on the deals themselves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.1}>
                <div className="card h-full p-7">
                  <h3 className="text-lg font-semibold text-ink-900">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-x">
          <Reveal>
            <div className="card relative flex flex-col items-start justify-between gap-6 overflow-hidden p-8 sm:flex-row sm:items-center sm:p-10">
              <span className="shimmer-sweep" />
              <div className="relative">
                <p className="eyebrow">The umbrella</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink-900">
                  Part of ExpoSQL AI Labs
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                  Rufus is one of several focused AI products from ExpoSQL AI Labs. See what else we&apos;re
                  building.
                </p>
              </div>
              <a
                href="https://exposql.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dark relative shrink-0"
              >
                Visit exposql.com <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA secondary={{ label: "Explore the tools", href: "/proposals" }} />
    </>
  );
}
