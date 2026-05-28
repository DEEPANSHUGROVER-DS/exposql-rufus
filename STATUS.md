# Rufus — current build status

A snapshot of where everything stands. Update this file as state changes
(new commits, new env vars set, new features shipped). Treat it as the
single place to ask "what's working, what's not, what's next?"

**Last meaningful change:** added persistence + view pages + hosted
proposal page at `/p/[slug]` + AI knowledge-base import + admin
workspace deep-dive.

---

## 1. Working today

- ✅ Build is **clean**. 44 routes (12 marketing + static, 18 API, 13 app, 1 public hosted page, 1 sign-in).
- ✅ Marketing site lives at `rufus.exposql.com`.
- ✅ Google sign-in works (NextAuth v5 + JWT, no DB adapter).
- ✅ DB tables are bootstrapped on Neon. **You must run `scripts/migrate-001-saved-context.sql` once** if you bootstrapped before the migration landed — see [§3](#3-pending-one-time-setup).
- ✅ App workspace: onboarding → dashboard → KB → settings.
- ✅ All three AI tools wired end-to-end **once `ANTHROPIC_API_KEY` is set** on Vercel.
- ✅ Stripe checkout wired **once `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set**.
- ✅ Admin panel + per-workspace deep-dive **once `ADMIN_EMAILS` is set**.
- ✅ Hosted public proposal pages at `/p/<slug>` work end-to-end including view-tracking.

---

## 2. Env-var configuration checklist

Hit `GET /api/health/auth` on production to confirm. Last reported status
(update when changed):

| Env var | Set on Vercel? | Effect if missing |
|---|---|---|
| `DATABASE_URL` | ✅ yes | Everything DB-backed returns 503 |
| `AUTH_SECRET` | ✅ yes | NextAuth refuses to sign sessions |
| `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` | ✅ yes | Sign-in returns `invalid_client` |
| `NEXT_PUBLIC_SITE_URL` | ✅ yes | Stripe redirect URLs default to `rufus.exposql.com` (correct anyway) |
| `ANTHROPIC_API_KEY` | ❓ (set when AI is wanted) | All AI endpoints return 503 `ai_not_configured` |
| `STRIPE_SECRET_KEY` | ❌ not set | Stripe checkout returns 503 `service_unavailable` |
| `STRIPE_WEBHOOK_SECRET` | ❌ not set | Webhook returns 500 `webhook_secret_missing` |
| `ADMIN_EMAILS` | ❓ (set when admin is wanted) | Admin link hidden, all `/api/admin/*` return 403 |
| `SETUP_TOKEN` | optional | `/api/admin/db-setup` refuses without a matching header |

---

## 3. Pending one-time setup

Things the **operator** still needs to do (not Claude):

1. **Run `scripts/migrate-001-saved-context.sql`** in the Neon SQL editor if
   you bootstrapped before this migration landed. Idempotent — safe to re-run.
   Adds `proposal.scope/timeline/tone` and `contract_review.source_text`.

2. **Set `ANTHROPIC_API_KEY`** on Vercel when you want the AI tools live.

3. **Set the Stripe env vars + create the webhook** on Stripe Dashboard:
   - URL: `https://rufus.exposql.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

4. **Set `ADMIN_EMAILS`** to your email (comma-separated for multiple admins).

5. *(Optional)* Set `SETUP_TOKEN` if you want the `/api/admin/db-setup` HTTP
   bootstrap endpoint (vs always using the Neon SQL editor directly).

---

## 4. Stripe — what's already provisioned

Live products and prices were created via the Stripe MCP into account
`acct_1TZu9cDs5O82YiC2` ("Exposql Checklist"). IDs are hardcoded in
`lib/stripe.ts`:

| Product (with "Rufus" in the name so it's distinguishable from other ExpoSQL products) | Product ID | Price ID | Amount |
|---|---|---|---|
| Rufus — Starter Plan | `prod_UbBEk3ZB8WXwei` | `price_1TbysLDs5O82YiC2rqsujnfC` | $39/mo |
| Rufus — Growth Plan | `prod_UbBEX9KipbdkWN` | `price_1TbysMDs5O82YiC2CZ8E0FBs` | $99/mo |
| Rufus — Scale Plan | `prod_UbBETtcdpUHk4n` | `price_1TbysMDs5O82YiC29g1ZgPS3` | $249/mo |
| Rufus — Credit Pack (100) | `prod_UbBEjJn0fFVb1f` | `price_1TbysNDs5O82YiC2NknzSA5H` | $15 |
| Rufus — Credit Pack (300) | `prod_UbBEKGyNyE3kjv` | `price_1TbysNDs5O82YiC24ankJlzm` | $39 |
| Rufus — Credit Pack (750) | `prod_UbBEeXotlGN93h` | `price_1TbysODs5O82YiC2mRXGWLOH` | $89 |
| Rufus — Credit Pack (2,000) | `prod_UbBEn1XveQhld8` | `price_1TbysODs5O82YiC2nbO4luyS` | $199 |

These are also in [`PRICING.md`](./PRICING.md#7-live-stripe-ids) for the
margin/strategy context. Updating either: change `lib/pricing.ts` (plans,
packs, action costs) — both the marketing pricing page and the in-app
credit meter read from there.

---

## 5. Pending features queue

In priority order if/when you pick this back up. Full descriptions in
[`FEATURES.md`](./FEATURES.md#18-pending-features-queue).

### High priority (close customer-perceived gaps)
1. **Cancel-subscription / Customer Portal** — Stripe management, **explicit defer** per user instruction.
2. **PDF + DOCX upload** for contract review.
3. **PDF export** for proposals (and contract reviews).
4. **Tiptap rich-text editor** for proposal sections.

### Medium
5. **Logo upload via Vercel Blob.**
6. **Brand colours applied to the in-app editor** (currently only on hosted `/p/<slug>` page).
7. **Inline AI edit endpoint** (`/api/ai/edit`) + selection-aware UI in the proposal editor.
8. **Editor side-panel assistant** (the 2–4cr action listed in pricing).
9. **Email notifications** (Resend integration).

### Lower
10. **GA4 + GTM analytics.**
11. **Admin: CSV export, drill into individual workspace items.**
12. **Contract follow-ups persisted** (currently per-session local state).
13. **Long-doc contract splitter** (currently capped at 60k chars).
14. **Annual plans** (currently monthly recurring only).
15. **E-sign capture** on the public proposal page (or integrate a signing provider).
16. **Free-plan KB cap UX** on the regular add modal (the import modal already handles it).

---

## 6. Known limitations / quirks

These are **deliberate decisions**, not bugs — don't "fix" them without
checking the context first:

- **No `main` branch.** The working branch (`claude/funny-meitner-3fkSH`) is
  the repo default. PRs require a base; if you want PR-based flow later,
  create `main` from current state, set as default, rebase the working
  branch on top.

- **Em dashes & eyebrow text used everywhere.** The initial brief said no
  em dashes and no eyebrow text, but the marketing kit handed to us was
  built around both. When asked which way to go, the user chose to keep the
  kit. Don't strip them.

- **Manual edits on RFP compose page are local-only.** The compose page
  (`/app/rfp`) shows results inline after generation, but those edits don't
  autosave. Edits only persist on the `/app/rfp/[id]` view page. By
  design — the compose flow is meant to be discardable.

- **Contract follow-ups not persisted.** They live in the page's local
  state. Refresh `/app/contracts/[id]` and they're gone. Acceptable for v1.

- **Free plan KB cap is server-enforced but not always surfaced.** The
  import modal handles the 402 nicely; the regular add modal silently rolls
  back the optimistic insert. Cosmetic gap.

- **Brand colours only apply on the hosted `/p/<slug>` page.** The in-app
  preview uses the system palette. Fixing this means threading CSS variables
  through `AppShell` + the editor. Tracked above.

- **Proposal hosted slugs include a 4-char random suffix** so they're
  non-guessable. We're not relying on slug obscurity for security, but
  making them un-bruteable is hygienic.

- **`spend()` in `AppProvider` is synchronous** (optimistic + fire-and-forget).
  This is so screens can short-circuit on insufficient credits without
  awaiting. AI endpoints don't go through this — they deduct credits
  server-side themselves. The client `spend()` is essentially dead code
  for AI flows now; only inline UI mock costs still use it.

- **`init.sql` is the canonical schema**, and it now bakes the migration
  ALTERs at the bottom so re-running it on a partially-migrated DB still
  catches up. The `migrate-001-...sql` file is a slimmer extract for
  operators who only want the delta.

---

## 7. Conversation history snapshots (so context isn't lost)

If a session crashes, these are the key decisions the user made along the
way that aren't otherwise discoverable from the code alone:

- **Kept the ExpoSQL design kit** (Plus Jakarta + Instrument Serif, cream/ink
  palette) over the brief's later suggestion of Fraunces/Inter + indigo. So
  visual style = the kit, not the brief's "distinct standalone look."

- **Marketing site shipped first, then the app on top.** App lives under
  `/app/*` to avoid colliding with marketing `/proposals`, `/rfp`, `/contracts`.

- **Free plan deliberately tightened** from "one of each" to "one task only"
  (one proposal *or* one contract review). 20 credits, watermarked, KB cap of 3.

- **RFP answer cost bumped from 1 to 2–4 per question** because the work
  involves KB recall + analysis + tone-matching, not just generation.

- **Reruns are not free.** Section regen, contract follow-ups, RFP
  re-answers all cost — set above token cost. RFP re-answer specifically
  costs the same as a fresh answer because the model does the same work;
  discounting it would invite users to taste-tune for free.

- **Stripe management deferred indefinitely.** The user said the team would
  set up Stripe later via the Stripe dashboard. We have checkout + webhook,
  but no Customer Portal or invoice download.

- **`ADMIN_EMAILS` is comma-separated** so adding a co-admin doesn't need a
  redeploy — just bump the env var.

- **`SETUP_TOKEN` vs `AUTH_SECRET`:** Both are "long random strings the
  operator makes up." `AUTH_SECRET` signs NextAuth JWTs (compromise → anyone
  can mint sessions). `SETUP_TOKEN` gates only the schema-bootstrap endpoint
  (compromise → someone can re-run idempotent CREATE-TABLE-IF-NOT-EXISTS;
  low blast radius). They are different secrets — don't reuse.

- **Brand colours only apply on the hosted page** by intentional scope cut.

---

## 8. Files to check first when something looks broken

| Symptom | First place to look |
|---|---|
| Sign-in fails with `invalid_client` | Google OAuth client config — redirect URI must be exactly `https://rufus.exposql.com/api/auth/callback/google` |
| `/api/workspace` returns 503 `database_not_configured` | `DATABASE_URL` env var |
| `/api/workspace` returns DB query error | Tables not bootstrapped — run `scripts/init.sql` |
| AI tools return 503 `ai_not_configured` | `ANTHROPIC_API_KEY` not set |
| Stripe checkout returns 503 | `STRIPE_SECRET_KEY` not set |
| Stripe webhook 500s | `STRIPE_WEBHOOK_SECRET` mismatch or missing |
| Admin link missing from sidebar | Your email isn't in `ADMIN_EMAILS` |
| `/p/<slug>` shows 404 | Proposal not yet published (`hostedSlug` is null), or slug typo |
| Build fails on Vercel | Check whether a new env-var-reading file errors at module load — the lazy patterns in `lib/db/index.ts` and `lib/ai/anthropic.ts` should prevent this, but new files might not follow the pattern |
| TypeScript build errors after schema change | Drizzle's inferred types changed — likely a `$inferInsert` or `$inferSelect` consumer that needs updating |

---

## 9. How to update this file

Whenever you ship a meaningful change:

1. Move the relevant item from "Pending features queue" to "Working today."
2. Update env-var checklist if a new env was added.
3. Update "Last meaningful change" at the top.
4. Add to "Conversation history snapshots" if you made a decision worth preserving.

The goal is that **a fresh Claude session can read this file and know exactly where to pick up.**
