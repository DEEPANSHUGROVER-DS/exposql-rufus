import Link from "next/link";

export const metadata = {
  title: "Subprocessors",
  description: "The third-party providers Rufus relies on to deliver the service, what data they process, and where.",
};

const lastUpdated = "May 28, 2026";

interface Subprocessor {
  name: string;
  purpose: string;
  data: string;
  region: string;
  dpaUrl: string;
  privacyUrl: string;
}

const subprocessors: Subprocessor[] = [
  {
    name: "Google LLC",
    purpose: "Sign-in (OAuth 2.0). We use Google as our identity provider — no Google Workspace data is read.",
    data: "Name, email, profile image, Google user ID.",
    region: "United States · global",
    dpaUrl: "https://cloud.google.com/terms/data-processing-addendum",
    privacyUrl: "https://policies.google.com/privacy",
  },
  {
    name: "Vercel Inc.",
    purpose: "Application hosting, CDN, serverless function execution.",
    data: "All data passes through Vercel infrastructure when serving the app, including authentication tokens and API payloads.",
    region: "United States · global edge",
    dpaUrl: "https://vercel.com/legal/dpa",
    privacyUrl: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Neon Inc.",
    purpose: "Managed Postgres database — primary store for workspace content (knowledge base, proposals, RFPs, contracts, ledger).",
    data: "All user-generated content, account metadata, ledger.",
    region: "United States · region of your Neon project",
    dpaUrl: "https://neon.tech/dpa",
    privacyUrl: "https://neon.tech/privacy-policy",
  },
  {
    name: "Anthropic, PBC",
    purpose: "Large language model API (Claude) for generating proposals, answering RFPs, reviewing contracts, splitting knowledge-base imports.",
    data: "Only the inputs you explicitly send to a generation — e.g. the question text, the contract text, your knowledge base when it is needed as context for an RFP. Inputs and outputs are not used to train Anthropic&apos;s base models.",
    region: "United States",
    dpaUrl: "https://www.anthropic.com/legal/dpa",
    privacyUrl: "https://www.anthropic.com/legal/privacy",
  },
  {
    name: "Stripe, Inc.",
    purpose: "Payments and subscription billing — checkout, recurring invoicing, credit-pack purchases.",
    data: "Name, email, billing address, card details (handled by Stripe — Rufus never sees the card number), purchase history.",
    region: "United States · global",
    dpaUrl: "https://stripe.com/legal/dpa",
    privacyUrl: "https://stripe.com/privacy",
  },
];

export default function SubprocessorsPage() {
  return (
    <div className="container-x py-36 sm:py-44">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Subprocessors</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: {lastUpdated}</p>

      <div className="mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink-700">
        <p>
          To deliver Rufus we rely on a small set of third-party providers
          (&ldquo;sub-processors&rdquo;) who process personal data on our behalf. Each one
          operates under their own data-processing agreement with us, with appropriate
          security and transfer safeguards.
        </p>
        <p>
          We&apos;ll update this page when we add, remove, or change a sub-processor.
          Material changes will be announced via our marketing channels at least 14 days
          before they take effect, giving you the chance to object.
        </p>

        <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">Current sub-processors</h2>
        <div className="space-y-4">
          {subprocessors.map((s) => (
            <div key={s.name} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-ink-900">{s.name}</h3>
                <span className="text-xs text-ink-400">{s.region}</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Purpose</dt>
                  <dd className="mt-1 text-ink-700">{s.purpose}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Data processed</dt>
                  <dd className="mt-1 text-ink-700">{s.data}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <a href={s.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline text-ink-700 hover:text-ink-900">
                  Privacy policy ↗
                </a>
                <a href={s.dpaUrl} target="_blank" rel="noopener noreferrer" className="underline text-ink-700 hover:text-ink-900">
                  Data processing addendum ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold tracking-[-0.01em] text-ink-900">International transfers</h2>
        <p>
          Several sub-processors are based in the United States. When personal data of EEA,
          UK or Swiss residents is transferred to them, we rely on the relevant transfer
          mechanism — typically the European Commission&apos;s Standard Contractual Clauses
          (and the UK addendum where applicable), supplemented by technical and
          organisational measures the sub-processor maintains under their DPA.
        </p>

        <h2 className="mt-10 text-xl font-semibold tracking-[-0.01em] text-ink-900">AI training opt-out</h2>
        <p>
          Anthropic, our AI provider, does not use customer API inputs or outputs to train its
          foundation models. Rufus inherits that posture: <strong>your workspace content is not
          used to train any AI model</strong> beyond the single inference call that delivered
          the output you asked for.
        </p>

        <h2 className="mt-10 text-xl font-semibold tracking-[-0.01em] text-ink-900">Questions</h2>
        <p>
          Contact <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>.
          Read the full <Link href="/privacy" className="underline">Privacy Policy</Link> for
          how we use the data overall.
        </p>
      </div>
    </div>
  );
}
