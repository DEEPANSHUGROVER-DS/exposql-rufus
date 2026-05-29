import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";

export const metadata = {
  title: "Cookie Policy",
  description: "How Rufus uses cookies and local storage, what each one does, and how to control them.",
};

const lastUpdated = "May 28, 2026";

interface CookieRow { name: string; provider: string; purpose: string; category: string; lifetime: string; }

const cookies: CookieRow[] = [
  {
    name: "next-auth.session-token",
    provider: "Rufus (first-party)",
    purpose: "Keeps you signed in. Signed JWT, set after Google sign-in.",
    category: "Strictly necessary",
    lifetime: "Session / up to 30 days",
  },
  {
    name: "next-auth.csrf-token",
    provider: "Rufus (first-party)",
    purpose: "CSRF protection for the sign-in flow.",
    category: "Strictly necessary",
    lifetime: "Session",
  },
  {
    name: "next-auth.callback-url",
    provider: "Rufus (first-party)",
    purpose: "Remembers where to send you after sign-in.",
    category: "Strictly necessary",
    lifetime: "Session",
  },
  {
    name: "rufus.consent.v1",
    provider: "Rufus (localStorage)",
    purpose: "Stores your cookie preferences. We need it to remember that you said no.",
    category: "Strictly necessary",
    lifetime: "Until cleared",
  },
  {
    name: "rufus.app.v1",
    provider: "Rufus (localStorage)",
    purpose: "Caches your workspace data client-side for snappier loads. Replaceable by a server fetch — clearing it logs you out of the app cache only.",
    category: "Strictly necessary",
    lifetime: "Until cleared",
  },
  {
    name: "_ga, _ga_*",
    provider: "Google Analytics (when enabled)",
    purpose: "Aggregate page-view + feature-use counts. Not active today; will only load if you accept Analytics and we set NEXT_PUBLIC_GA4_ID.",
    category: "Analytics",
    lifetime: "2 years",
  },
  {
    name: "__stripe_mid, __stripe_sid",
    provider: "Stripe",
    purpose: "Set by Stripe Checkout to prevent fraud during a purchase. Only set during a checkout session.",
    category: "Strictly necessary",
    lifetime: "30 minutes – 1 year",
  },
];

export default function CookiesPage() {
  return (
    <div className="container-x py-36 sm:py-44">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Cookie Policy</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: {lastUpdated}</p>

      <div className="mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink-700">
        <Section title="1. What this is">
          <p>
            This Cookie Policy explains how Rufus (operated by ExpoSQL AI Labs) uses cookies and
            similar storage technologies — including browser localStorage — on{" "}
            <Link href="/" className="underline">rufus.exposql.com</Link>. Read it alongside our{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>, which covers the
            full picture of how we handle personal data.
          </p>
        </Section>

        <Section title="2. Categories we use">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Strictly necessary.</strong> Required to deliver the service —
              authentication, security, remembering your cookie choice. Always on; you cannot
              turn them off without breaking core functionality.
            </li>
            <li>
              <strong>Analytics.</strong> Aggregate, anonymised usage metrics so we can tell what
              works. <em>Off by default.</em> Currently not active in production — this category
              exists so the consent infrastructure is ready when we add Google Analytics 4.
            </li>
            <li>
              <strong>Marketing.</strong> Cross-site advertising and personalisation. <em>Off by
              default.</em> Not currently active. We don&apos;t sell personal information for
              behavioural advertising (see{" "}
              <Link href="/do-not-sell" className="underline">Do Not Sell or Share</Link>).
            </li>
          </ul>
        </Section>

        <Section title="3. The cookies and storage we set">
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="border-b border-ink-900/[0.06] px-2 py-2">Name</th>
                  <th className="border-b border-ink-900/[0.06] px-2 py-2">Provider</th>
                  <th className="border-b border-ink-900/[0.06] px-2 py-2">Category</th>
                  <th className="border-b border-ink-900/[0.06] px-2 py-2">Lifetime</th>
                  <th className="border-b border-ink-900/[0.06] px-2 py-2">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <tr key={c.name} className="align-top">
                    <td className="border-b border-ink-900/[0.04] px-2 py-3 font-mono text-[12px] text-ink-900">
                      {c.name}
                    </td>
                    <td className="border-b border-ink-900/[0.04] px-2 py-3 text-ink-600">{c.provider}</td>
                    <td className="border-b border-ink-900/[0.04] px-2 py-3 text-ink-600">{c.category}</td>
                    <td className="border-b border-ink-900/[0.04] px-2 py-3 text-ink-600">{c.lifetime}</td>
                    <td className="border-b border-ink-900/[0.04] px-2 py-3 text-ink-600">{c.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Third-party cookies">
          <p>
            Some pages — sign-in, billing — embed third-party services that set their own
            cookies on your device. We don&apos;t control those cookies; the providers do.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Google</strong> (sign-in only) — sets authentication cookies on{" "}
              <em>accounts.google.com</em> when you complete the OAuth flow. See{" "}
              <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="underline">Google&apos;s cookies page</a>.
            </li>
            <li>
              <strong>Stripe</strong> (checkout only) — sets fraud-prevention cookies during a
              checkout session. See{" "}
              <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer" className="underline">Stripe&apos;s cookie settings</a>.
            </li>
            <li>
              <strong>Vercel</strong> (hosting) — may set short-lived cookies to route traffic
              and detect abuse. See{" "}
              <a href="https://vercel.com/legal/cookies" target="_blank" rel="noopener noreferrer" className="underline">Vercel&apos;s cookie policy</a>.
            </li>
          </ul>
        </Section>

        <Section title="5. How to manage your choices">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Use the <strong>cookie banner</strong> on your first visit, or re-open it at any
              time with the <strong>Cookie preferences</strong> link in the footer or the button
              below.
            </li>
            <li>
              We honour the{" "}
              <a
                href="https://globalprivacycontrol.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Global Privacy Control
              </a>{" "}
              browser signal. If your browser sends it, we treat non-essential cookies as denied
              and skip the banner entirely.
            </li>
            <li>
              Your browser&apos;s privacy settings can also block or delete cookies. Doing so
              may sign you out of Rufus or cause minor display glitches; necessary cookies will
              be reset on your next visit.
            </li>
          </ul>
          <div className="pt-2">
            <CookiePreferencesButton />
          </div>
        </Section>

        <Section title="6. Changes to this policy">
          <p>
            We&apos;ll update this page when our cookie use changes. The &ldquo;Last
            updated&rdquo; date at the top of this page reflects the current version.
            Material changes — for example, adding a new analytics provider — will trigger the
            consent banner again so you can review and re-confirm.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Questions: <a href="mailto:hello@exposql.com" className="underline">hello@exposql.com</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
      <div className="space-y-3 text-ink-700">{children}</div>
    </section>
  );
}
