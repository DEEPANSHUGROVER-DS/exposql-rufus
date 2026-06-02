# Rufus — architecture

Tech stack, file layout, schema, auth flow, key patterns, and **all the hard
lessons** the initial brief warned us about. Read this when you need to
recover the *how* (vs the *what*, which is in [`FEATURES.md`](./FEATURES.md)).

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2** (App Router, Turbopack) | React 19, TypeScript strict |
| Styles | **Tailwind CSS v3.4** | No CSS-in-JS, no design-system library |
| Animation | **Framer Motion 11** | Used everywhere — scroll reveals, micro-motion, page transitions |
| Icons | **Lucide React** | |
| Auth | **NextAuth v5 (beta 31)** + `@auth/core` | JWT session strategy, **no DB adapter** |
| DB | **Drizzle ORM 0.45** + `@neondatabase/serverless` 1.1 | HTTP driver for Vercel edge-friendly serverless |
| Hosting | **Vercel** | All routes; static prerender for marketing, dynamic for API + app |
| Payments | **Stripe 22.x** | Live mode, account `acct_1TZu9cDs5O82YiC2` |
| AI | **Anthropic Claude** (`@anthropic-ai/sdk` 0.99.x) | Default model `claude-sonnet-4-6`; prompt caching on |
| Validation | **Zod 4** | Available as a dep; mostly inline runtime checks for now |

Node 22 in CI; `runtime: "nodejs"` on every API route that touches Drizzle
or Anthropic.

---

## 2. File layout

```
app/
  layout.tsx                   Root layout: html + body + fonts + SilkBackground.
                               Marketing chrome lives in (marketing)/layout.tsx, not here.
  globals.css                  Tailwind layers + component classes (.btn-dark, .card, .input, etc.)
  sitemap.ts, robots.ts        SEO
  signin/page.tsx              Google sign-in (NextAuth server action)

  (marketing)/                 Marketing route group — wraps in Navbar + Footer
    layout.tsx
    page.tsx                   Home
    proposals/page.tsx
    rfp/page.tsx
    contracts/page.tsx
    pricing/page.tsx
    pricing/PricingClient.tsx
    about/page.tsx
    privacy/page.tsx
    terms/page.tsx

  app/                         The product. URL prefix = /app/*
    layout.tsx                 AppProvider + AppShell
    page.tsx                   Dashboard
    onboarding/page.tsx
    knowledge/page.tsx         CRUD + AI import modal
    rfp/page.tsx               Compose
    rfp/[id]/page.tsx          Reopen saved response (autosave)
    contracts/page.tsx         Compose
    contracts/[id]/page.tsx    Reopen saved review + follow-up box
    proposals/page.tsx         List
    proposals/new/page.tsx     Form → redirect to /[id]
    proposals/[id]/page.tsx    Editor with section regen, publish, autosave
    settings/page.tsx          Brand kit + billing
    admin/page.tsx             Admin overview
    admin/workspaces/[id]/page.tsx   Per-workspace deep-dive

  p/[slug]/                    Public hosted proposal page (no auth)
    page.tsx                   Server-rendered branded proposal
    TrackView.tsx              Client cmp that fires the view-track POST
    track/route.ts             POST to set viewed_at (idempotent)

  api/
    auth/[...nextauth]/route.ts        NextAuth handler
    workspace/route.ts                 GET/PATCH workspace + bundled data
    knowledge/route.ts                 GET/POST
    knowledge/[id]/route.ts            PATCH/DELETE
    credits/route.ts                   GET ledger, POST to spend
    proposals/route.ts                 GET list
    proposals/[id]/route.ts            GET/PATCH/DELETE
    rfp/route.ts                       GET list
    rfp/[id]/route.ts                  GET/PATCH/DELETE
    contracts/route.ts                 GET list
    contracts/[id]/route.ts            GET/DELETE
    ai/rfp/route.ts                    POST — AI answer
    ai/proposal/route.ts               POST — AI generate or section regen
    ai/contract/route.ts               POST — AI review
    ai/contract/followup/route.ts      POST — AI follow-up
    ai/knowledge-import/route.ts       POST — AI split-and-import
    stripe/checkout/route.ts           POST — create Checkout Session
    stripe/webhook/route.ts            POST — Stripe events
    admin/db-setup/route.ts            POST (SETUP_TOKEN header) — run schema
    admin/stats/route.ts               GET — admin-only
    admin/grant/route.ts               POST — admin-only
    admin/workspaces/[id]/route.ts     GET — admin-only
    health/auth/route.ts               GET — env + db + session diagnostic

auth.ts                        NextAuth config at repo root; exports handlers/auth/signIn/signOut

components/
  Silk.tsx                     SilkBackground + SilkRibbon
  Navbar.tsx                   Marketing nav
  Footer.tsx                   Marketing footer
  Logo.tsx                     Brand wordmark
  Reveal.tsx                   Scroll-reveal wrapper
  CountUp.tsx                  Animated number
  Waveform.tsx                 EQ-bar "AI working" indicator
  Marquee.tsx                  Dual-direction task strip
  Showcase.tsx                 Manual-tabbed three interactive demos
  Faq.tsx                      Accordion
  CTA.tsx                      Section CTA with SilkRibbon
  ToolPage.tsx                 Shared template for the three marketing tool pages
  mocks.tsx                    Card thumbnail demos (auto-replay)
  demos/InteractiveProposal.tsx
  demos/InteractiveRfp.tsx
  demos/InteractiveContract.tsx
  app/AppProvider.tsx          Client context — fetches /api/workspace, exposes spend(), refresh(), etc.
  app/AppShell.tsx             Sidebar + topbar + onboarding gate + sign-out
  app/PricingEditor.tsx        Shared editable line-items table
  app/ui.tsx                   PageHeader, Panel, CostBadge, EmptyState

lib/
  pricing.ts                   Single source of truth: plans, packs, per-action costs, helpers
  content.ts                   Marketing copy data (tool blurbs, FAQs, etc.)
  admin.ts                     isAdmin(email) checks ADMIN_EMAILS env
  stripe.ts                    Stripe client + live price IDs + pack credit mapping
  db/
    schema.ts                  Drizzle schema (all tables)
    index.ts                   Eager Drizzle init via @neondatabase/serverless
    queries.ts                 ensureUserAndWorkspace, spendCredits, grantCredits, listX, creditsRemaining
    sql.ts                     INIT_SQL — used by /api/admin/db-setup
  ai/
    anthropic.ts               Lazy client, model const, JSON parser
    rfp.ts                     answerRfp()
    proposal.ts                generateProposal() + section keys
    contract.ts                reviewContract() + askContractFollowup()
    knowledge.ts               splitIntoEntries()
  app/
    types.ts                   AppState, WorkspaceProfile, KnowledgeEntry, RecentItem, LedgerEntry, Plan
    format.ts                  relativeTime, statusLabel/Style, kindLabel

scripts/
  init.sql                     Idempotent CREATE TABLE IF NOT EXISTS for the whole schema
  migrate-001-saved-context.sql  ALTER TABLE for the scope/timeline/tone/source_text columns

PRICING.md                     Full pricing strategy & rationale
PRODUCT.md                     What Rufus is + brand rules
FEATURES.md                    Full feature inventory with built/pending
ARCHITECTURE.md                This file
STATUS.md                      Current build state, env-var checklist, pending queue
README.md                      Index pointing to all the above

.env.example                   Every env var the app reads
tailwind.config.ts             Palette + keyframes + animations
postcss.config.js              Tailwind + autoprefixer
next.config.mjs                reactStrictMode: true
tsconfig.json                  Strict, paths "@/*": ["./*"]
package.json
```

---

## 3. Hard lessons (from the initial brief — DON'T re-break these)

1. **JWT sessions, not the Drizzle adapter.** Database sessions cause a deadlock at first sign-in: NextAuth tries to insert a session row, but the user table doesn't have the user yet, but the user can't sign in to create themselves. JWT bypasses the cycle. → `session: { strategy: "jwt" }` in `auth.ts`.

2. **Resolve user + workspace by email, not by JWT sub.** The JWT `sub` is opaque from Google; it won't equal our `users.id`. Always: `SELECT user WHERE email = token.email`, insert if missing, then look up workspace by `ownerId = user.id`. → `ensureUserAndWorkspace()` in `lib/db/queries.ts`. Every authenticated API route calls this idempotent helper.

3. **Initialise Drizzle eagerly, never behind a Proxy.** Wrapping the client in a JS Proxy breaks dialect detection at build time. → `lib/db/index.ts` instantiates the client at module load using a placeholder URL if `DATABASE_URL` is unset so the build doesn't crash.

4. **On first app load, upsert the user row before inserting the workspace.** Same FK-crash story. → `ensureUserAndWorkspace()` does both in the correct order. (No starting credit grant — pay-as-you-go signups start with a zero balance.)

5. **Add diagnostics early.** → `/api/health/auth` returns a JSON checklist of env vars + a one-row probe against the users table; `/api/admin/db-setup` runs the schema with a `SETUP_TOKEN` header. Both were in the brief and both saved hours during initial bootstrapping.

6. **Set `metadataBase`, `sitemap.ts`, `robots.ts` early.** Done — they're in `app/`.

7. **No em dashes, no eyebrow text.** *We broke this one deliberately.* The marketing kit the user handed us was eyebrow-heavy and em-dash-heavy, and they chose to keep the kit when asked which way to go. So Rufus uses both. Don't "fix" them.

---

## 4. Schema

Tables (in `lib/db/schema.ts`; SQL in `scripts/init.sql`):

### NextAuth-shape (kept even with JWT sessions so first sign-in can record the user)
- `user(id, name, email UNIQUE, emailVerified, image, created_at)`
- `account(userId FK, type, provider, providerAccountId, ..., PK(provider, providerAccountId))`
- `session(sessionToken PK, userId FK, expires)` — unused with JWT, kept for parity.
- `verificationToken(identifier, token, expires, PK(identifier, token))` — unused with Google, kept for parity.

### Rufus domain
- `workspace(id, owner_id FK -> user.id, profile fields, plan, stripe_*, credits_*, brand fields, created_at)`
  - One workspace per user (the owner).
  - `credits_remaining = credits_included + credits_bought - credits_used`.
- `knowledge_entry(id, workspace_id FK, title, body, tags jsonb, created/updated_at)`
- `proposal(id, workspace_id FK, client_name, title, scope, timeline, tone, sections jsonb, pricing jsonb, status, hosted_slug UNIQUE, viewed_at, created/updated_at)`
- `rfp_response(id, workspace_id FK, title, source_text, answers jsonb [{question, answer, confidence, sourceEntryId, approved}], status, created/updated_at)`
- `contract_review(id, workspace_id FK, title, file_name, source_text, summary jsonb [str], red_flags jsonb [{severity, clause, reason}], suggested_edits jsonb [{original, replacement, reason}], created_at)`
- `credit_ledger(id, workspace_id FK, delta, reason, source, ref_id, created_at)`
  - `delta < 0` = spend, `delta > 0` = grant/refund/purchase.
  - `source ∈ { "ai", "purchase", "grant", "refund" }`.
- `credit_purchase(id, workspace_id FK, stripe_session_id UNIQUE, pack_key, credits, amount, status, created_at)`

Indexes (defined in `init.sql`): `workspace_owner_idx`, `workspace_stripe_sub_idx`, `*_workspace_idx` on each child table, `purchase_workspace_idx`.

### Migrations
Each migration is a separate idempotent `.sql` file in `scripts/`. The user
runs them in the Neon SQL editor (or via `/api/admin/db-setup` which runs
`INIT_SQL`, which now includes the migration ALTERs too).

- `init.sql` — fresh-install schema.
- `migrate-001-saved-context.sql` — adds `proposal.scope/timeline/tone` + `contract_review.source_text` for reopen-with-context.

---

## 5. Auth flow

```
Browser                            Server                            DB
   |                                  |                                |
   |--- GET /app -------------------->|                                |
   |                                  |---  no session, redirect       |
   |<-- 302 /signin -------------------|                                |
   |                                  |                                |
   |--- click "Continue with Google"->| /signin server action          |
   |                                  | signIn("google", { redirectTo })|
   |<-- 302 to Google -----------------|                                |
   |--- Google OAuth dance ---------->| /api/auth/callback/google      |
   |                                  | NextAuth verifies, builds JWT  |
   |<-- 302 /app with cookie ----------|                                |
   |                                  |                                |
   |--- GET /api/workspace ---------->|                                |
   |                                  | auth() reads JWT cookie        |
   |                                  | ensureUserAndWorkspace({email})|
   |                                  |---- SELECT user WHERE email -->|
   |                                  |<--- (none yet) ----------------|
   |                                  |---- INSERT user --------------->|
   |                                  |---- SELECT workspace ----------|
   |                                  |<--- (none yet) ----------------|
   |                                  |---- INSERT workspace ----------|
   |                                  |---- INSERT ledger +20 ---------|
   |                                  | return workspace + KB + ledger + recent
   |<-- 200 JSON ---------------------|                                |
```

Subsequent requests are cheap: `ensureUserAndWorkspace` is idempotent and
just does two SELECTs in the common case.

---

## 6. Credit deduction pattern

Used by every AI endpoint:

```ts
// 1. Compute cost (deterministic from input)
const cost = computeCost(input);

// 2. Atomic spend (returns false if insufficient)
const spendRes = await spendCredits(workspace.id, cost, reason, "ai");
if (!spendRes.ok) return NextResponse.json({ error: "insufficient_credits" }, { status: 402 });

// 3. AI call — wrap in try/catch
let result;
try {
  result = await callClaude(...);
} catch (err) {
  // 4. On failure, refund
  await grantCredits(workspace.id, cost, "Refund: ... failed", "refund");
  return NextResponse.json({ error: "ai_failed", detail }, { status: 502 });
}

// 5. Persist the output (proposal/rfp/contract row)
const [saved] = await db.insert(table).values({...}).returning();

// 6. Return id + content + remaining credits
return NextResponse.json({ id: saved.id, ...result, remaining: spendRes.remaining });
```

Why this order matters:
- Pre-deduct prevents concurrent calls from over-spending.
- Refund-on-failure means the user is **never charged for a generation that didn't deliver**.
- Persisting after AI but inside the same request means we don't write half-finished data.

The `knowledge-import` endpoint adds a wrinkle: it estimates cost up-front,
then reconciles after the AI returns the actual entry count (refund if
fewer, top-up if more, tolerated if the top-up fails — we keep what we
generated).

---

## 7. AI prompt caching strategy

All three endpoints use Anthropic's prompt-caching to cut costs on
follow-on calls in the same session.

| Endpoint | Cached block | Why |
|---|---|---|
| `/api/ai/rfp` | workspace profile + all KB entries | Question 2+ of a batch reads cache instead of paying full input. |
| `/api/ai/proposal` | workspace profile + KB | Section regen on the [id] page re-uses the cache. |
| `/api/ai/contract` | none on the first review (no prior context) | — |
| `/api/ai/contract/followup` | the contract text | Follow-ups are 3–5cr because the contract is cached. |
| `/api/ai/knowledge-import` | none | Single call. |

Cache lifetime is per Anthropic's caching window. We don't store cache
explicitly; we just send the same blocks on each request and Anthropic
matches.

---

## 8. State management — `AppProvider`

`components/app/AppProvider.tsx` is the only client-side store. Every page
under `/app/*` reads through `useApp()`.

### What it exposes
```ts
interface AppContextValue {
  // Data
  profile: WorkspaceProfile;     // company, tone, brand colours, onboardingComplete
  plan: Plan;                    // free | starter | growth | scale
  creditsIncluded: number;
  creditsUsed: number;
  remaining: number;             // derived: included + bought - used
  knowledge: KnowledgeEntry[];
  recent: RecentItem[];
  ledger: LedgerEntry[];
  status: "loading"|"ready"|"error"|"unauthenticated";
  errorMessage: string|null;
  isAdmin: boolean;              // server told us whether the email is in ADMIN_EMAILS

  // Actions (all client-side optimistic + server-side fire-and-forget)
  spend(amount, reason): boolean;       // synchronous, false if insufficient
  setProfile(patch): void;
  completeOnboarding(): void;
  addKnowledge(e): void;
  updateKnowledge(id, patch): void;
  removeKnowledge(id): void;
  addRecent(item): void;                // local-only — server is canonical for the list
  refresh(): Promise<void>;             // re-fetch /api/workspace
}
```

### Failure modes
- **401** from `/api/workspace` → `window.location.href = /signin?callbackUrl=…`.
- **503** (DB or AI not configured) → friendly error banner with link to `/api/health/auth`.
- **Network error** → leaves optimistic state alone; `refresh()` reconciles.

### Why `spend` is sync
The screens (`/app/rfp`, `/app/contracts`, `/app/proposals/new`) need a
synchronous "do I have enough credits?" check before opening a busy state.
The implementation:
1. Sync check `remaining < amount` → return false.
2. Sync optimistic update of state.
3. Async fire `POST /api/credits` in the background.
4. On API failure, roll back the optimistic ledger entry.

The actual AI endpoints don't call `spend()` from the client; they call
`spendCredits()` server-side themselves. The client `spend()` is only used
for local UI flows (e.g. inline edit costs, mock-mode actions) where the
server hasn't been wired yet.

---

## 9. Environment variables

Full list with descriptions. All set on Vercel project for production.

### Required for the app to function at all
```
DATABASE_URL              Neon pooled connection string (postgres://...?sslmode=require)
AUTH_SECRET               openssl rand -base64 32 — signs the NextAuth JWT
AUTH_GOOGLE_ID            Google OAuth client ID
AUTH_GOOGLE_SECRET        Google OAuth client secret
NEXT_PUBLIC_SITE_URL      https://rufus.exposql.com (also used for Stripe redirect URLs)
NEXTAUTH_URL              same as above
```

### Required for AI tools
```
ANTHROPIC_API_KEY         from console.anthropic.com
ANTHROPIC_MODEL           optional override; default = claude-sonnet-4-6
```

### Required for billing
```
STRIPE_SECRET_KEY         sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET     whsec_... — the signing secret of THIS endpoint, per-app
STRIPE_PRICE_STARTER      price_1TbysLDs5O82YiC2rqsujnfC
STRIPE_PRICE_GROWTH       price_1TbysMDs5O82YiC2CZ8E0FBs
STRIPE_PRICE_SCALE        price_1TbysMDs5O82YiC29g1ZgPS3
STRIPE_PRICE_PACK_100     price_1TbysNDs5O82YiC2NknzSA5H
STRIPE_PRICE_PACK_300     price_1TbysNDs5O82YiC24ankJlzm
STRIPE_PRICE_PACK_750     price_1TbysODs5O82YiC2mRXGWLOH
STRIPE_PRICE_PACK_2000    price_1TbysODs5O82YiC2nbO4luyS
```

The 7 STRIPE_PRICE_* are **optional** — those exact IDs are hardcoded in
`lib/stripe.ts`. Setting env values only matters if you want to swap to
test-mode prices in non-prod.

### Required for admin
```
ADMIN_EMAILS              comma-separated emails that can see /app/admin
```

### Optional bootstrap helper
```
SETUP_TOKEN               long random — gates POST /api/admin/db-setup
```

### Future (not yet wired)
```
RESEND_API_KEY            email notifications
EMAIL_FROM
NEXT_PUBLIC_GTM_ID        analytics
NEXT_PUBLIC_GA4_ID
BLOB_READ_WRITE_TOKEN     Vercel Blob for logo uploads
```

`.env.example` mirrors all of these.

---

## 10. Build & deploy

```bash
npm install
npm run build          # static prerender for marketing, dynamic for API + app + signin + /p/[slug]
npm run start          # serve production build locally
```

Vercel:
- Repo is connected.
- Default branch is the working branch (`claude/funny-meitner-3fkSH`).
- Every push deploys.
- All env vars set on the project.
- Domain `rufus.exposql.com` connected.

Note: there's no separate `main` branch. The working branch is the default,
which means we ship directly. If you want a PR-based flow later, create
`main` from the current state, set it as default, and rebase the working
branch onto it.

---

## 11. CSS / design conventions

### Component classes (in `app/globals.css` under `@layer components`)
- `.container-x` — page-width container
- `.accent-italic` — italic-serif span for the signature accent word
- `.eyebrow` — section label
- `.btn-dark` / `.btn-soft` — primary / secondary
- `.card` — rounded card with soft shadow
- `.chip` — small pill
- `.input` — text inputs/textareas

### Utility classes (not Tailwind, custom in globals.css)
- `.silk-blob` — absolute-positioned blurred circle used by `SilkBackground`
- `.marquee-mask` — edge-fade for the task strip
- `.shimmer-sweep` — diagonal sweep that loops across cards
- `.grain` — SVG noise overlay used by `SilkBackground`

### Tailwind config additions (in `tailwind.config.ts`)
- Custom palette: `paper`, `ink`, `silk`, `accent` (see [`PRODUCT.md`](./PRODUCT.md#palette)).
- Custom keyframes: `silk-1/2/3`, `float`, `marquee`, `marquee-rev`, `spin-slow`, `shimmer`, `eq`, `pulse-ring`.
- Custom shadows: `soft`, `lift`, `pill`.
- Custom animations using the keyframes above.

### Don't introduce
- CSS-in-JS or styled-components.
- A design-system library (shadcn, Radix Primitives, MUI, etc.).
- Heroicons or Material icons — use Lucide only.

---

## 12. Diagnostics & recovery

If something's broken in production:

1. `GET https://rufus.exposql.com/api/health/auth` returns a JSON checklist of:
   - Every env var the app reads (boolean: set or not).
   - The current session (or "unauthenticated").
   - Whether a one-row probe against the `user` table succeeds (`dbOk` boolean).
   - A truncated DB error string if the probe fails (most common: tables don't exist → run `init.sql`).

2. If the DB looks dead but env says set: connect to Neon directly, paste `scripts/init.sql` + every `migrate-*.sql` in the editor.

3. If sign-in says `Error 401: invalid_client`: Google OAuth client misconfigured — see [`STATUS.md`](./STATUS.md) for the checklist.

4. If checkout says `service_unavailable`: missing `STRIPE_SECRET_KEY`. Webhook errors → missing `STRIPE_WEBHOOK_SECRET` or signing-secret mismatch (per-endpoint).

5. If AI tools say `ai_not_configured`: missing `ANTHROPIC_API_KEY`.
