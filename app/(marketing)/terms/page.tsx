import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of service for Rufus, an AI workspace by ExpoSQL AI Labs.",
};

const lastUpdated = "May 28, 2026";

export default function TermsPage() {
  return (
    <div className="container-x py-36 sm:py-44">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: {lastUpdated}</p>

      <div className="prose mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink-700">
        <Section title="1. Acceptance">
          <p>
            These Terms govern your access to and use of Rufus, a product of ExpoSQL AI Labs
            (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;). By signing in
            or using the service you accept these Terms and our{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>. If you do not
            agree, do not use the service.
          </p>
        </Section>

        <Section title="2. Eligibility & accounts">
          <p>
            You must be 16 or older to use Rufus. You are responsible for all activity under your
            account and for keeping your Google sign-in credentials secure.
          </p>
        </Section>

        <Section title="3. Plans, credits, and billing">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Paid plans renew monthly through Stripe at the price shown on the{" "}
              <Link href="/pricing" className="underline">Pricing page</Link>. Plan allowances
              refresh at the start of each billing cycle and do not roll over.
            </li>
            <li>
              Credit packs are one-time purchases and do not expire while your account remains
              active.
            </li>
            <li>
              Every AI action shows a credit range before it runs and deducts credits after.
              Manual editing is free.
            </li>
            <li>
              Charges are non-refundable except where required by law or at our discretion.
            </li>
            <li>
              Prices and credit costs may change with notice; changes will not apply to the
              current billing cycle.
            </li>
          </ul>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to use Rufus to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Violate any law, infringe intellectual property, or harm third parties.</li>
            <li>Upload content you do not have the right to share, or sensitive data (PHI, payment card numbers, government IDs) outside what the service is designed for.</li>
            <li>Reverse engineer, scrape, or attempt to exceed credit limits or rate limits.</li>
            <li>Resell, sublicense, or share access without our written consent.</li>
            <li>Generate spam, harassment, defamatory content, malware, or material that exploits minors.</li>
            <li>Train competing AI models on outputs produced by the service.</li>
          </ul>
          <p>We may suspend or terminate accounts that breach these rules.</p>
        </Section>

        <Section title="5. Your content">
          <p>
            You retain ownership of the content you upload and create in Rufus. You grant us a
            limited, worldwide licence to host, process, and display your content solely to
            operate the service for you and your workspace.
          </p>
        </Section>

        <Section title="6. AI outputs">
          <p>
            Rufus generates drafts and analysis with the help of AI. AI outputs are probabilistic
            and may contain errors, omissions, or fabrications. <strong>You are responsible for
            reviewing every output before you use, send, or act on it.</strong> Subject to your
            compliance with these Terms, you own the outputs you generate from your own inputs.
            Outputs may be similar across customers and we make no representation that any output
            is novel or infringement-free.
          </p>
          <p>
            <strong>Rufus is not a law firm and does not provide legal advice.</strong> The
            contract-review feature produces a plain-English summary, ranked red flags, and
            suggested edits for your review only. It is not a substitute for advice from a
            qualified lawyer in your jurisdiction.
          </p>
        </Section>

        <Section title="7. Service availability">
          <p>
            We work to keep the service available, but it is provided on an &ldquo;as is&rdquo;
            and &ldquo;as available&rdquo; basis. We may modify, suspend, or discontinue features
            with reasonable notice.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            You may cancel at any time from settings. We may terminate your account for breach of
            these Terms or non-payment. On termination, your access ends; unused credits are
            forfeit unless required to be refunded by law.
          </p>
        </Section>

        <Section title="9. Warranty disclaimer">
          <p>
            To the maximum extent permitted by law, the service is provided without warranties of
            any kind, express or implied, including merchantability, fitness for a particular
            purpose, non-infringement, accuracy, or uninterrupted availability.
          </p>
        </Section>

        <Section title="10. Limitation of liability">
          <p>
            To the maximum extent permitted by law, neither party will be liable for indirect,
            incidental, special, consequential, punitive, or exemplary damages, or for loss of
            profits, revenue, data, or goodwill. Our aggregate liability arising out of or
            relating to the service will not exceed the greater of (a) the amount you paid us in
            the 12 months before the event giving rise to liability, or (b) US$100.
          </p>
        </Section>

        <Section title="11. Indemnity">
          <p>
            You will indemnify and hold us harmless from claims arising out of your content, your
            use of outputs, or your breach of these Terms.
          </p>
        </Section>

        <Section title="12. Confidentiality">
          <p>
            We treat your workspace content as confidential and apply commercially reasonable
            safeguards to protect it. See the Privacy Policy for details about sub-processors and
            AI processing.
          </p>
        </Section>

        <Section title="13. Changes to these Terms">
          <p>
            We may update these Terms. If a change materially reduces your rights, we&apos;ll give
            you notice and a chance to cancel. Continued use after changes means you accept them.
          </p>
        </Section>

        <Section title="14. Governing law and disputes">
          <p>
            These Terms are governed by the laws of the jurisdiction in which ExpoSQL AI Labs is
            established, without regard to its conflict-of-laws rules. Disputes will be resolved
            in the competent courts of that jurisdiction, except where mandatory consumer
            protection law in your country provides otherwise.
          </p>
        </Section>

        <Section title="15. Contact">
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
