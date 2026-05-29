import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "How Rufus, a product of ExpoSQL AI Labs, collects, uses, and protects your information.",
};

const lastUpdated = "May 28, 2026";

export default function PrivacyPage() {
  return (
    <div className="container-x py-36 sm:py-44">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: {lastUpdated}</p>

      <div className="prose mt-10 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink-700">
        <Section title="1. Who we are">
          <p>
            Rufus is operated by ExpoSQL AI Labs (&ldquo;<strong>ExpoSQL</strong>&rdquo;, &ldquo;
            <strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;). This Privacy Policy
            explains what personal data we collect, how we use it, and the choices you have. It
            applies to <Link href="/" className="underline">rufus.exposql.com</Link> and the in-app
            workspace.
          </p>
        </Section>

        <Section title="2. What we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Account data:</strong> name, email, profile image, and a unique user ID from
              Google when you sign in.
            </li>
            <li>
              <strong>Workspace content:</strong> the company profile, knowledge-base entries,
              proposals, RFP responses, contract uploads, and brand assets you create or upload.
            </li>
            <li>
              <strong>Billing data:</strong> Stripe customer ID, subscription status, and credit
              ledger. Card details are handled by Stripe, not us.
            </li>
            <li>
              <strong>Usage data:</strong> device, browser, IP, and product interaction logs we use
              to keep the service running and improve it.
            </li>
            <li>
              <strong>Cookies:</strong> a session cookie for authentication and (where used) a
              small set of analytics cookies. See section 8.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To provide and run the Rufus product, including generating proposals, answering RFPs from your knowledge base, and reviewing contracts you submit.</li>
            <li>To bill, track credits, and prevent abuse.</li>
            <li>To send service announcements and respond to support requests.</li>
            <li>To debug, monitor performance, and improve features. Aggregate or de-identified analytics may be retained.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal data, and we do not use your workspace
            content to train third-party foundation models. Your content is processed by AI
            providers (currently Anthropic) only as needed to fulfil the requests you initiate.
          </p>
        </Section>

        <Section title="4. AI processing">
          <p>
            When you ask Rufus to generate or analyse something, the relevant text from your
            workspace (e.g. the knowledge-base entries you select, the contract you upload, the
            proposal form you submit) is sent to our AI provider to compute the response. Outputs
            are returned to your workspace, stored under your account, and not shared with other
            customers.
          </p>
          <p>
            Rufus is not a law firm. Contract review outputs (summaries, red flags, suggested
            edits) are for your review and convenience — they are not legal advice and you should
            not rely on them as a substitute for qualified counsel.
          </p>
        </Section>

        <Section title="5. Sharing with sub-processors">
          <p>We rely on a small set of providers, each with appropriate data-processing terms:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Google</strong> — sign-in (OAuth).</li>
            <li><strong>Neon</strong> — managed Postgres database hosting.</li>
            <li><strong>Vercel</strong> — application hosting and CDN.</li>
            <li><strong>Stripe</strong> — payments and subscriptions.</li>
            <li><strong>Anthropic</strong> — AI generation and review.</li>
          </ul>
        </Section>

        <Section title="6. Where your data is stored">
          <p>
            Data is stored on managed infrastructure operated by the sub-processors listed above,
            in the regions they support. Backups are encrypted at rest.
          </p>
        </Section>

        <Section title="7. Retention and deletion">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Workspace content</strong> (knowledge base, proposals, RFP responses, contract reviews, brand kit) — retained while your account is active. You can delete individual items at any time. We delete on account closure within 30 days.</li>
            <li><strong>Account &amp; identity</strong> (name, email, Google user ID) — retained while the account is active; deleted within 30 days of closure.</li>
            <li><strong>Credit ledger</strong> — retained for as long as the workspace exists, then deleted with it.</li>
            <li><strong>Billing records</strong> (Stripe receipts, invoices) — retained for 7 years after the transaction, as required by tax and accounting laws.</li>
            <li><strong>Server logs</strong> — typically 30–90 days for security and debugging; longer when investigating an incident.</li>
            <li><strong>Backups</strong> — encrypted database backups roll off on Neon&apos;s retention schedule, typically within 30 days.</li>
          </ul>
          <p>
            Deletion may take longer where data has propagated to backups; we ensure deleted
            data is not restored to active systems and is overwritten on the normal backup
            rotation.
          </p>
        </Section>

        <Section title="8. Cookies and analytics">
          <p>
            We set a session cookie for authentication and store your cookie preferences in
            local storage. Analytics and marketing cookies are <strong>off by default</strong>;
            they only load if you opt in via our banner, and we honour the Global Privacy
            Control browser signal as an automatic opt-out. Full detail in the{" "}
            <Link href="/cookies" className="underline">Cookie Policy</Link>.
          </p>
        </Section>

        <Section title="9. Your rights — everyone">
          <p>
            Wherever you live, you may ask us to access, correct, export, or delete the
            personal data we hold about you, and to object to or restrict certain processing.
            Email{" "}
            <a href="mailto:privacy@exposql.com" className="underline">privacy@exposql.com</a>{" "}
            and we&apos;ll respond within 30 days (45 in California). We may need to verify
            your identity using information we already hold about you.
          </p>
        </Section>

        <Section title="9a. EEA / UK / Swiss residents">
          <p>
            For users in the European Economic Area, United Kingdom, or Switzerland, the
            following supplements section 9.
          </p>
          <p><strong>Controller.</strong> ExpoSQL AI Labs is the controller of your personal data for purposes of GDPR / UK GDPR.</p>
          <p><strong>Legal bases for processing.</strong> We rely on:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><em>Contract</em> — to provide the service you signed up for (account creation, document generation, billing).</li>
            <li><em>Legitimate interests</em> — to keep the service secure, prevent abuse, debug, and improve features. We balance these against your rights and can give you details of the assessment on request.</li>
            <li><em>Consent</em> — for analytics and marketing cookies, and any optional features that ask for it. Consent can be withdrawn at any time.</li>
            <li><em>Legal obligation</em> — to keep tax/accounting records, to respond to lawful requests from authorities.</li>
          </ul>
          <p>
            <strong>Your rights</strong> include access, rectification, erasure, restriction,
            objection, portability, and the right to withdraw consent. You also have the right
            to <strong>lodge a complaint with your supervisory authority</strong> — for example,
            the UK ICO or your country&apos;s data-protection authority — though we&apos;d
            appreciate the chance to address concerns first.
          </p>
          <p>
            <strong>International transfers.</strong> Most of our sub-processors are in the
            United States. When personal data is transferred from the EEA/UK/Switzerland to a
            third country without an adequacy decision, we rely on the European
            Commission&apos;s Standard Contractual Clauses (with the UK addendum where
            applicable), supplemented by technical and organisational measures the receiver
            maintains under their DPA. See the{" "}
            <Link href="/subprocessors" className="underline">Subprocessors</Link> page for the
            current list.
          </p>
        </Section>

        <Section title="9b. California residents">
          <p>
            See our dedicated <Link href="/do-not-sell" className="underline">Do Not Sell or
            Share My Personal Information</Link> page for the full California disclosures,
            including your rights to know, access, delete, correct, opt out of sale/sharing,
            and limit the use of sensitive personal information.
          </p>
          <p>
            <strong>Summary:</strong> we do not sell personal information for money, and we do
            not share it for cross-context behavioural advertising. We honour Global Privacy
            Control as an automatic opt-out.
          </p>
        </Section>

        <Section title="10. Children">
          <p>Rufus is not intended for users under 16. We do not knowingly collect data from children.</p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this policy. If the change is material, we&apos;ll notify you via the
            product or by email. The &ldquo;Last updated&rdquo; date at the top of this page will
            always reflect the current version.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions or requests:{" "}
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
