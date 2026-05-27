import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/Faq";
import { CTA } from "@/components/CTA";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — plans and credit packs",
  description:
    "Monthly plans with included AI credits, plus credit packs anyone can buy. Every AI action shows a credit range before it runs, and manual editing is always free.",
};

const pricingFaqs = [
  { q: "How do credits work?", a: "AI actions cost credits by output length — a proposal is more than a single RFP answer. Every action shows a credit range before you run it and deducts the actual amount after. Manual editing never costs credits." },
  { q: "Do credits expire?", a: "No. Credit packs you buy never expire. Monthly plan allowances refresh each month." },
  { q: "Can I buy credits without a subscription?", a: "Yes. Credit packs are available to anyone, with no monthly plan required." },
  { q: "What happens when I hit zero?", a: "AI actions pause until you top up with a pack or your monthly allowance refreshes. A credit ledger records every spend and purchase." },
];

export default function PricingPage() {
  return (
    <>
      <section className="px-5 pb-12 pt-36 sm:px-8 sm:pt-44">
        <div className="container-x">
          <Reveal>
            <div className="flex justify-center">
              <p className="eyebrow">Pricing</p>
            </div>
            <h1 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.2rem]">
              Pay for the work, <span className="accent-italic text-accent">not the busywork</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-ink-500">
              Plans include monthly AI credits. Buy credit packs any time. Manual editing is always free,
              and every AI action shows its cost before you click.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-x">
          <PricingClient />
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-x">
          <Reveal>
            <div className="flex justify-center">
              <p className="eyebrow">Questions</p>
            </div>
            <h2 className="mt-4 text-center text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Pricing, <span className="accent-italic text-accent">plainly</span>.
            </h2>
          </Reveal>
          <div className="mt-12">
            <Faq items={pricingFaqs} />
          </div>
        </div>
      </section>

      <CTA secondary={{ label: "Explore the tools", href: "/proposals" }} />
    </>
  );
}
