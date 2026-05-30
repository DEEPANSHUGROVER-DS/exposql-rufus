# Rufus — current build status

A snapshot of where everything stands. Update this file as state changes
(new commits, new env vars set, new features shipped). Treat it as the
single place to ask "what's working, what's not, what's next?"

**Last meaningful change:** big sprint — PDF export, document upload,
Stripe Customer Portal, Vercel Blob logo upload, Resend email
notifications, account deletion + data export (GDPR), inline AI edit
endpoint, theme styling on hosted page, global Cmd/K search, admin CSV
exports, contract follow-up persistence, "out of credits" UX, free-plan
KB-cap surface, delete buttons across all lists, brand CSS variables in
the AppShell.

---

## 1. Working today

- ✅ Build is **clean**. ~60 routes (marketing + static, API, app screens, public hosted proposal, sign-in).
- ✅ Marketing site lives at `rufus.exposql.com`.
- ✅ Google sign-in works (NextAuth v5 + JWT, no DB adapter).
- ✅ DB tables are bootstrapped on Neon. **You must run `scripts/migrate-001-saved-context.sql` AND `scripts/migrate-002-followups-deletion-blob.sql` once** if you bootstrapped before those migrations landed — see [§3](#3-pending-one-time-setup).
- ✅ App workspace: onboarding → dashboard → KB → settings.
- ✅ All three AI tools wired end-to-end **once `ANTHROPIC_API_KEY` is set** on Vercel.
- ✅ Stripe checkout + Customer Portal wired **once `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set**.
- ✅ Admin panel + per-workspace deep-dive **once `ADMIN_EMAILS` is set**.
- ✅ Hosted public proposal pages at `/p/<slug>` work end-to-end including view-tracking AND a "your proposal was opened" email when Resend is configured.
- ✅ PDF export for proposals and contract reviews works server-side via `@react-pdf/renderer` — branded with the workspace's primary/accent colours and logo.
- ✅ PDF/DOCX/TXT upload on the contract review tool — pdfjs-dist loads the worker from a CDN, mammoth handles DOCX. Text is extracted client-side, sent through the existing AI endpoint.
- ✅ Global Cmd/Ctrl+K search across knowledge / proposals / RFPs / contracts. Keyboard-navigable; debounced; ILIKE-based with snippet extraction.
- ✅ Out-of-credits banner on the three AI tool pages with a link to top-up.
- ✅ Delete buttons on every list (proposals, RFPs, contracts, knowledge). Confirm-then-delete.
- ✅ Filter + sort + status chips on /app/proposals.
- ✅ Free-plan KB cap (3 entries) properly surfaced in the regular add modal — used to fail silently.
- ✅ Contract follow-ups **persist** on saved reviews now (per-review followups jsonb column).
- ✅ Contract section re-run endpoint (5–8 cr) updates the stored summary/flags/edits in place.
- ✅ Theme selector (Light / Warm / Bold) actually styles the hosted `/p/<slug>` page differently.
- ✅ Logo upload via Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set, plus a URL-paste fallback that always works.
- ✅ Welcome email on first sign-in, proposal-viewed email on first hosted-page open, out-of-credits helper — all silent no-ops when `RESEND_API_KEY` is missing.
- ✅ Account self-service: **download my data** (ZIP of every workspace row as JSON) and **delete account** (with email-confirmation gate; FK cascades wipe all child rows).
- ✅ Admin CSV exports for users / purchases / ledger.
- ✅ Inline AI edit endpoint at `/api/ai/edit` (1 credit) — UI integration deferred until the editor refactor, but the API is live.

---

## 2. Env-var configuration checklist

Hit `GET /api/health/auth` on production to confirm. Last reported status
(update when changed):

| Env var | Set on Vercel? | Effect if missing |
|---|---|---|
| `DATABASE_URL` | ✅ yes | Everything DB-backed returns 503 |
| `AUTH_SECRET` | ✅ yes | NextAuth refuses to sign sessions |
| `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` | ✅ yes | Sign-in returns `invalid_client` |
| `NEXT_PUBLIC_SITE_URL` | ✅ yes | Stripe redirect URLs default to `rufus.exposql.com` |
| `ANTHROPIC_API_KEY` | ❓ (set when AI is wanted) | All AI endpoints return 503 `ai_not_configured` |
| `STRIPE_SECRET_KEY` | ❌ not set | Stripe checkout + portal return 503 |
| `STRIPE_WEBHOOK_SECRET` | ❌ not set | Webhook returns 500 `webhook_secret_missing` |
| `ADMIN_EMAILS` | ❓ | Admin link hidden, `/api/admin/*` return 403 |
| `BLOB_READ_WRITE_TOKEN` | ❌ not set | Logo upload returns 503 — URL field still works |
| `RESEND_API_KEY` + `EMAIL_FROM` | ❌ not set | All transactional emails silently no-op |
| `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GTM_ID` | ❌ not set | Analytics doesn't load (consent + gate already in place) |
| `SETUP_TOKEN` | optional | `/api/admin/db-setup` refuses without a matching header |

---

## 3. Pending one-time setup

Things the **operator** still needs to do (not Claude):

1. **Run both migrations** in the Neon SQL editor if you bootstrapped
   before they landed:
   - `scripts/migrate-001-saved-context.sql` — adds proposal.scope/timeline/tone and contract_review.source_text.
   - `scripts/migrate-002-followups-deletion-blob.sql` — adds contract_review.followups, workspace.deletion_requested_at, workspace.logo_blob_url.
   Both idempotent (`IF NOT EXISTS`).

2. **Set `ANTHROPIC_API_KEY`** on Vercel when you want the AI tools live.

3. **Set the Stripe env vars + create the webhook** on Stripe Dashboard:
   - URL: `https://rufus.exposql.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

4. **Set `ADMIN_EMAILS`** to your email.

5. *(Optional)* **Configure the Stripe Customer Portal** at Stripe Dashboard → Settings → Billing → Customer portal (live). Without this, the "Open billing portal" button errors. With it, users can cancel, change card, download invoices entirely through Stripe.

6. *(Optional)* **Set `BLOB_READ_WRITE_TOKEN`** to enable logo upload. Generate at Vercel → Storage → Create Blob → reveal token.

7. *(Optional)* **Set `RESEND_API_KEY` + `EMAIL_FROM`** to turn on transactional email. The "From" must be a verified sender in your Resend account.

8. *(Optional)* Set `SETUP_TOKEN` for the HTTP DB-bootstrap helper.

---

## 4. Stripe — what's already provisioned

Same as the prior status — seven live products + prices in
`acct_1TZu9cDs5O82YiC2`. See [`PRICING.md`](./PRICING.md#7-live-stripe-ids).

Customer Portal session creation now works via `/api/stripe/portal` and is
exposed in Settings as **Open billing portal**.

**Annual plans:** not created yet. To add: create three annual prices in
Stripe Dashboard ("Rufus — Starter Annual" etc.), then either hardcode
the IDs in `lib/stripe.ts` or set them via env. The pricing page can be
extended with a monthly/yearly toggle.

---

## 5. Pending features queue

### Wired and ready, just needs the env var
- **Email notifications** — set `RESEND_API_KEY` + `EMAIL_FROM`.
- **Logo upload to Vercel Blob** — set `BLOB_READ_WRITE_TOKEN`.
- **Analytics** — set `NEXT_PUBLIC_GA4_ID` and/or `NEXT_PUBLIC_GTM_ID`.

### Optional polish (no decision blocking)
1. **Long-doc contract splitter** — currently capped at 60k chars with a warning. A real section-by-section flow would re-run the review per chunk and merge results.
2. **Inline AI edit UI integration** — the `/api/ai/edit` endpoint is live (1 credit). A floating menu on text-selection in the proposal editor would expose it. Held because the proposal editor uses plain textareas, where selection-menu UX is awkward; the API is there if/when an editor refactor happens.
3. **Per-workspace drill into items** in admin — admin currently shows counts, not item lists.
4. **Brand colours applied across the in-app editor preview.** CSS variables `--brand-primary` and `--brand-accent` are exposed on the AppShell root; specific surfaces can opt in by reading them. The default Tailwind `text-accent` still wins everywhere else.

### Deliberately not building (decisions captured in §7)
- ❌ **Rich-text editor (Tiptap).** Plain textareas are sufficient. Bold/italic isn't worth the HTML sanitisation pipeline.
- ❌ **E-sign capture** on hosted proposals. Clients can download the PDF and sign with Adobe / DocuSign on their side. We create proposals, we don't offer signing.
- ❌ **Annual plans.** Monthly only. Annual locks us in to refund/proration complexity and removes optionality to pivot/sunset.
- ❌ **Teammate invites / multi-user workspaces / SSO / enterprise tier.** Single-user only at every plan. Customers who need multi-user workflows run separate accounts.

---

## 6. Known limitations / quirks

- **No `main` branch.** Working branch is the default. Not blocking.
- **Em dashes & eyebrow text used everywhere** by deliberate decision.
- **Contract follow-ups now persist** on saved reviews. The compose-page (`/app/contracts`) flow still keeps them in local state until the review is saved — open the saved review via `/app/contracts/[id]` for the persisted history.
- **PDF text extraction uses a CDN-hosted pdf.js worker** (`unpkg.com`). If your environment blocks CDNs, swap to a self-hosted worker file in `/public`.
- **PDF export renders plain text** in section bodies — no rich formatting. When Tiptap lands, the PDF renderer needs an HTML→react-pdf parser (or we strip tags).
- **Admin Refund helper not built** — refunds today happen in Stripe Dashboard. Logging the resulting credit-clawback into our ledger is also manual.
- **Free plan KB cap is 3 entries** — server enforces, both modals now surface the error cleanly.
- **Stripe Customer Portal requires a one-time dashboard config** before the button works.

---

## 7. Conversation history snapshots (decisions worth preserving)

- **Kept the ExpoSQL design kit** over Fraunces/Inter rebuild.
- **Marketing site shipped first, then the app on top.** App lives under `/app/*`.
- **Free plan deliberately tightened** to "one task only" (one proposal *or* one contract review), 20 credits, watermarked, KB cap 3.
- **RFP answer cost is 2–4 per question** (not flat 1) because the work involves recall + analysis + tone-matching.
- **Reruns are not free.** Section regen, contract follow-ups, RFP re-answers all cost.
- **Stripe management partially lifted** — Customer Portal is wired (Settings → Open billing portal). Manual cancel/invoice handling is gone.
- **`ADMIN_EMAILS` is comma-separated** so adding a co-admin doesn't need a redeploy.
- **`AUTH_SECRET` vs `SETUP_TOKEN`** are different secrets, don't reuse.
- **Brand colours fully apply on hosted `/p/<slug>`** including theme variants. In-app preview is opt-in via the CSS variables now exposed.
- **Rich-text editor (Tiptap) explicitly NOT pursued.** Plain textareas are the design. Bold/italic doesn't justify the HTML-sanitisation pipeline + PDF re-rendering complexity. If a customer ever asks for emphasis, the cheapest add is markdown-style `**bold**` parsing on the hosted page only (~30 lines, no library needed) — not Tiptap.
- **E-sign capture explicitly NOT in scope.** Rufus creates proposals; clients sign on their side (download the PDF, use Adobe / DocuSign / sign-in-person). Not a Rufus problem.
- **No annual plans, ever.** Monthly only. Annual locks us into refund/proration complexity around credit allowances and removes the optionality to pivot or sunset the product cleanly.
- **No teammate / multi-user / enterprise functionality at any plan.** Single-user only. Customers needing multi-user run separate accounts. This keeps the credit model clean and avoids RBAC/SSO drift.

---

## 8. Files to check first when something looks broken

| Symptom | First place to look |
|---|---|
| Sign-in fails with `invalid_client` | Google OAuth client config |
| DB query error | Run `migrate-001` and `migrate-002` SQL |
| AI tools return 503 `ai_not_configured` | `ANTHROPIC_API_KEY` |
| Stripe checkout 503 | `STRIPE_SECRET_KEY` |
| Webhook 500s | `STRIPE_WEBHOOK_SECRET` mismatch or missing |
| Open billing portal errors | Customer Portal not configured in Stripe Dashboard |
| Admin link missing | Your email not in `ADMIN_EMAILS` |
| Logo upload 503 | `BLOB_READ_WRITE_TOKEN` not set |
| Emails not arriving | `RESEND_API_KEY` not set, or `EMAIL_FROM` not verified in Resend |
| PDF download 500s | Vercel function timed out (max 30s for proposals, 30s for contract reviews) — make the contract review shorter |
| `/p/<slug>` shows 404 | Proposal not yet published |
| Cmd-K does nothing | Browser intercepted it — Ctrl-K works on Windows/Linux |
| Search returns nothing | Need ≥ 2 characters; ILIKE pattern matching against title + body fields |

---

## 9. How to update this file

Whenever you ship a meaningful change:

1. Move the relevant item from "Pending features queue" to "Working today."
2. Update env-var checklist if a new env was added.
3. Update "Last meaningful change" at the top.
4. Add to "Conversation history snapshots" if you made a decision worth preserving.

The goal is that **a fresh Claude session can read this file and know exactly where to pick up.**
