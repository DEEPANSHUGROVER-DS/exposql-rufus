import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";

export const metadata = {
  title: "Do Not Sell or Share My Personal Information",
  description: "Your California rights under CCPA/CPRA and how to exercise them with Rufus.",
};

const lastUpdated = "May 28, 2026";

export default function DoNotSellPage() {
  return (
    <div className="container-x py-36 sm:py-44">
      <p className="eyebrow">Legal · California</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-[2.6rem] sm:leading-tight">
        Do Not Sell or Share <span className="accent-italic text-accent">My Personal Information</span>
      </h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: {lastUpdated}</p>

      <div className="mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink-700">
        <Section title="1. Summary — what we do and don't do">
          <p>
            <strong>We do not sell your personal information for money</strong>, and we do not
            share it with third parties for cross-context behavioural advertising. We don&apos;t
            run advertising on Rufus today. The phrases <em>&ldquo;sell&rdquo;</em> and{" "}
            <em>&ldquo;share&rdquo;</em> here have the broad definitions given to them by the
            California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights
            Act (CPRA).
          </p>
          <p>
            We still provide this page because the law requires us to offer the right to opt
            out, and because we want you to be able to assert it in one place regardless of
            what we do in the future.
          </p>
        </Section>

        <Section title="2. Your rights as a California consumer">
          <p>If you are a California resident, you have the right to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Know</strong> what personal information we collect, the sources, the purposes, and the categories of recipients.
            </li>
            <li>
              <strong>Access</strong> a copy of the personal information we hold about you.
            </li>
            <li>
              <strong>Delete</strong> personal information we collected from you, with limited exceptions (e.g. records we&apos;re legally required to retain for tax).
            </li>
            <li>
              <strong>Correct</strong> inaccurate personal information.
            </li>
            <li>
              <strong>Opt out of sale or sharing</strong> of personal information.
            </li>
            <li>
              <strong>Limit use of sensitive personal information</strong> to what&apos;s strictly necessary to provide the service.
            </li>
            <li>
              <strong>Non-discrimination</strong> — we won&apos;t deny service, charge a different price, or provide a lower quality of service because you exercised these rights.
            </li>
          </ul>
        </Section>

        <Section title="3. How we honour the opt-out">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Global Privacy Control (GPC).</strong> When your browser sends the GPC
              signal, we automatically apply an opt-out to your session: analytics and marketing
              categories are denied, no banner is shown, and the choice is recorded.
            </li>
            <li>
              <strong>Cookie preferences.</strong> Use the banner or the button below to set
              your categories at any time.
            </li>
            <li>
              <strong>Email request.</strong> Send us your request directly at{" "}
              <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>{" "}
              with the subject line &ldquo;Do Not Sell or Share&rdquo;. We&apos;ll confirm
              within 15 business days and complete the request within the timelines required
              by California law.
            </li>
          </ul>
          <div className="pt-2">
            <CookiePreferencesButton />
          </div>
        </Section>

        <Section title="4. Submitting an access, deletion, or correction request">
          <p>
            Email <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>{" "}
            from the address associated with your Rufus account. Include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>The request type (access / delete / correct).</li>
            <li>Enough detail for us to verify your identity — we may ask for additional information consistent with what we already hold about you.</li>
            <li>For corrections, the specific item to correct and the corrected value.</li>
          </ul>
          <p>
            We respond within 45 days. We may extend by another 45 days if your request is
            complex, and we&apos;ll tell you when we do. Requests are free unless they&apos;re
            manifestly unfounded or excessive — we&apos;ll explain any charges in advance.
          </p>
        </Section>

        <Section title="5. Authorized agents">
          <p>
            You may use an authorized agent to submit a request on your behalf. The agent must
            provide written permission signed by you, and we may still verify your identity
            directly. Send the agent&apos;s request to{" "}
            <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>.
          </p>
        </Section>

        <Section title="6. Categories of personal information we collect">
          <p>
            For full detail see the <Link href="/privacy" className="underline">Privacy
            Policy</Link>. In summary, in the past 12 months Rufus has collected:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Identifiers</strong> — name, email, Google user ID.</li>
            <li><strong>Customer records</strong> — account information.</li>
            <li><strong>Commercial information</strong> — subscription, credit ledger.</li>
            <li><strong>Internet activity</strong> — log files, device + browser metadata.</li>
            <li><strong>User-generated content</strong> — workspace profile, knowledge base, proposals, RFP responses, contracts uploaded for review.</li>
          </ul>
          <p>
            We do not knowingly collect biometric identifiers, geolocation data more precise
            than approximate IP-based location, government IDs, or any other category of
            sensitive personal information beyond what is needed to operate the product.
          </p>
        </Section>

        <Section title="7. Sale and sharing — past 12 months">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Sale of personal information:</strong> <strong>none.</strong></li>
            <li><strong>Sharing for cross-context behavioural advertising:</strong> <strong>none.</strong></li>
            <li><strong>Disclosure for a business purpose:</strong> categories listed in the Privacy Policy &mdash; primarily our sub-processors (sign-in, hosting, payments, database, AI provider). See the <Link href="/subprocessors" className="underline">Subprocessors</Link> page.</li>
          </ul>
        </Section>

        <Section title="8. Children">
          <p>Rufus is not directed at and not used by individuals under 16. We do not knowingly sell or share personal information about minors.</p>
        </Section>

        <Section title="9. Contact">
          <p>
            Privacy team: <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>. General contact:{" "}
            <a href="mailto:hello@exposql.com" className="underline">hello@exposql.com</a>.
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
