/**
 * Email send helper backed by Resend. No-op when RESEND_API_KEY is missing —
 * we never want a missing env to crash a request path, just to skip sending.
 *
 * Set on Vercel:
 *   RESEND_API_KEY=re_...
 *   EMAIL_FROM="Rufus <hello@yourdomain.com>"   (must be a verified Resend sender)
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Rufus <hello@exposql.com>";

const resend = apiKey ? new Resend(apiKey) : null;

export const EMAIL_CONFIGURED = Boolean(apiKey);

interface SendOptions {
  to: string;
  subject: string;
  /** Plain-text body (will also be auto-quoted in HTML if html missing). */
  text: string;
  /** Optional HTML body. */
  html?: string;
  /** Optional reply-to. */
  replyTo?: string;
}

export async function sendEmail(opts: SendOptions): Promise<{ sent: boolean; reason?: string }> {
  if (!resend) return { sent: false, reason: "email_not_configured" };
  if (!opts.to || !opts.subject) return { sent: false, reason: "invalid_args" };
  try {
    await resend.emails.send({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? toHtml(opts.text),
      replyTo: opts.replyTo,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: String(e).slice(0, 160) };
  }
}

function toHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1B1A16;background:#F4F0E8;padding:32px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:18px;padding:32px">${escaped}<hr style="border:none;border-top:1px solid #1B1A1611;margin:24px 0"><p style="color:#8C8779;font-size:12px;margin:0">Sent by Rufus · <a href="https://rufus.exposql.com" style="color:#5b5bd6">rufus.exposql.com</a></p></div></div>`;
}

// ---------- Specific templates ----------

export function sendWelcomeEmail(to: string, name: string | null) {
  return sendEmail({
    to,
    subject: "Welcome to Rufus",
    text: `Hi ${name || "there"},

Welcome to Rufus — the AI workspace for proposals, RFP responses, and contract review.

Rufus is pay-as-you-go: free to sign up, browse the workspace, and curate your knowledge base. When you're ready to generate, buy a credit pack (starts at $15 for 100 credits) or subscribe to a monthly plan.

A good first hour:
  1. Add a few knowledge entries (security overview, pricing approach, company background)
  2. Pick a credit pack: https://rufus.exposql.com/pricing
  3. Try the strongest tool on your knowledge base: https://rufus.exposql.com/app/rfp

Manual editing is always free, on every plan.

Questions? Just reply to this email.

— The Rufus team`,
  });
}

export function sendProposalViewedEmail(to: string, opts: { clientName: string; title: string; slug: string }) {
  return sendEmail({
    to,
    subject: `${opts.clientName} opened your proposal`,
    text: `Good news — ${opts.clientName} just opened "${opts.title}" for the first time.

View the hosted proposal: https://rufus.exposql.com/p/${opts.slug}
Edit or follow up: https://rufus.exposql.com/app/proposals

— Rufus`,
  });
}

export function sendOutOfCreditsEmail(to: string, name: string | null) {
  return sendEmail({
    to,
    subject: "You're out of Rufus credits",
    text: `Hi ${name || "there"},

You've used all of this cycle's Rufus credits. AI generation is paused until you top up.

Manual editing keeps working — it's always free.

Top up here: https://rufus.exposql.com/app/settings

— Rufus`,
  });
}
