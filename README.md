# Rufus — by ExpoSQL AI Labs

The AI workspace for the documents that win and close business. Three tools — a
proposal/SOW generator, an RFP & questionnaire autopilot, and a contract
review tool — share one workspace, one credit balance, and one brand kit.

Live at **[rufus.exposql.com](https://rufus.exposql.com)**.

---

## Recovery context

If a Claude Code session crashed mid-task, **start here**. These files
together capture the full state of the product, what's been built, and how
the pieces fit:

| File | Read it when you need… |
|---|---|
| [`PRODUCT.md`](./PRODUCT.md) | What Rufus is, who it's for, brand voice, positioning, design system, the "honest framing" rules we follow everywhere. |
| [`FEATURES.md`](./FEATURES.md) | The full feature catalogue — every screen, every API route, the user flow through each tool, and a **built / pending** marker on each item. |
| [`PRICING.md`](./PRICING.md) | The credit model, per-action costs, plan tiers, credit packs, token COGS math, the live Stripe product/price IDs, and why each number is what it is. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech stack, file layout, schema, auth flow, credit-deduction pattern, env-var reference, hard lessons from the brief. |
| [`STATUS.md`](./STATUS.md) | Current build state — env-var checklist, what's wired, what's mocked, the prioritised "build next" queue. |

---

## Quick reference for a fresh session

```
Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 3
Auth: NextAuth v5 (beta) · Google · JWT sessions (no DB adapter)
DB: Drizzle ORM · Neon Postgres (serverless)
Payments: Stripe — live products in account acct_1TZu9cDs5O82YiC2 ("Exposql Checklist")
AI: Anthropic Claude — default model `claude-sonnet-4-6`, prompt caching on
Branch: claude/funny-meitner-3fkSH (currently the repo default)
```

### One-line summaries of the three tools

- **Proposals & SOWs** — fill a short form, Claude drafts a sectioned proposal with a pricing table; publish to a branded hosted URL the client can open.
- **RFP autopilot** — paste an RFP, Claude answers each question from your knowledge base with a confidence score and a source citation. Never invents.
- **Contract review** — paste a contract, get a plain-English summary, ranked red flags, and suggested edits. Cached so follow-ups stay cheap. *For your review — not legal advice.*

### Pricing in one paragraph

Nothing is unlimited. Every AI action spends credits (~$0.10 retail each, ~$0.012 token COGS). Plans: Free ($0, 20 one-time credits — one task), Starter ($39/mo, 400 credits), Growth ($99/mo, 1,200 credits), Scale ($249/mo, 3,500 credits). Credit packs (100/300/750/2,000) never expire. Per-action: proposal 12–20, RFP 2–4/question, contract review 10–30, contract follow-up 3–5, KB import 2/entry. Full table in [`PRICING.md`](./PRICING.md).

### The five env vars that matter

```
DATABASE_URL         # Neon connection string
AUTH_SECRET          # `openssl rand -base64 32`
AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET   # from Google Cloud OAuth client
STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET   # from Stripe dashboard
ANTHROPIC_API_KEY    # from Anthropic console
ADMIN_EMAILS         # comma-separated, gates /app/admin
```

Full list with descriptions in `.env.example` and [`ARCHITECTURE.md`](./ARCHITECTURE.md#environment-variables).

### Conventions worth remembering

- **Never** call contract review "legal advice" — it's "for your review."
- **Never** let the AI invent — if no source supports an RFP answer, flag it.
- **No em dashes were forbidden** in an earlier brief, but the design system uses them heavily; we kept them deliberately (see the conversation history in `STATUS.md`).
- All numbers in [`PRICING.md`](./PRICING.md) are draft for review — change them in `lib/pricing.ts` (single source of truth) and the marketing page + in-app meter both update.

---

## Scripts

```bash
npm run dev      # local dev (needs all env vars)
npm run build    # production build (CI gate)
npm run start    # serve the production build
npm run lint     # Next/TypeScript lint
```

## Database bootstrap

Either path works. Both idempotent.

```bash
# Easiest: paste scripts/init.sql into the Neon SQL editor
# Then any migration files: scripts/migrate-001-saved-context.sql, etc.

# Or hit the admin endpoint once SETUP_TOKEN is set on Vercel
curl -X POST -H "x-setup-token: <SETUP_TOKEN>" \
  https://rufus.exposql.com/api/admin/db-setup
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#schema) for the schema.
