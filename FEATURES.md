# Rufus — feature inventory

The complete catalogue of what's built and what's still to build, with every
screen, route, API endpoint, and AI prompt strategy. Read this when you need
to recover the full picture of what exists.

**Legend:** ✅ built · 🟡 partial / has known gaps · ❌ not started

---

## Table of contents

1. [Marketing site](#1-marketing-site)
2. [Authentication & sign-in](#2-authentication--sign-in)
3. [Onboarding wizard](#3-onboarding-wizard)
4. [Dashboard](#4-dashboard)
5. [Knowledge base](#5-knowledge-base)
6. [RFP autopilot](#6-rfp-autopilot)
7. [Contract review](#7-contract-review)
8. [Proposal generator + editor + hosted page](#8-proposal-generator--editor--hosted-page)
9. [Brand kit](#9-brand-kit)
10. [Settings & billing](#10-settings--billing)
11. [Admin panel](#11-admin-panel)
12. [Credit system](#12-credit-system)
13. [AI integration layer](#13-ai-integration-layer)
14. [Stripe integration](#14-stripe-integration)
15. [Document I/O — uploads & exports](#15-document-io--uploads--exports)
16. [Notifications](#16-notifications)
17. [Analytics](#17-analytics)
18. [Pending features queue](#18-pending-features-queue)

---

## 1. Marketing site

Routes under `app/(marketing)/`.

### Pages
- ✅ **Home** (`/`) — hero with manual-tabbed `Showcase` of the three interactive demos, hero subtext, tasks marquee (continuous animation), three-tool overview cards with replaying mock thumbnails + hover lift + floating sparkle accent, "How it works" 3-steps, comparison + count-up tile (e.g. 6 wks → 1 day), FAQ accordion, CTA band with `SilkRibbon`.
- ✅ **Proposals** (`/proposals`) — hero, `InteractiveProposal` demo (live editable pricing rows + tone selector + Generate button), feature grid, how-it-works, mini-pricing teaser, FAQ, CTA.
- ✅ **RFP** (`/rfp`) — hero, `InteractiveRfp` demo (paste questions → auto-answer with confidence + source), feature grid, how-it-works, mini-pricing teaser, FAQ, CTA.
- ✅ **Contracts** (`/contracts`) — hero, `InteractiveContract` demo (paste → tabs Summary / Red flags / Suggested edits), feature grid, how-it-works, mini-pricing teaser, FAQ, CTA.
- ✅ **Pricing** (`/pricing`) — 4 plan cards + 4 credit pack cards, monthly/credit toggle, per-action cost table (data from `lib/pricing.ts`), credits explainer.
- ✅ **About** (`/about`) — principles + ExpoSQL umbrella link.
- ✅ **Privacy** (`/privacy`) — covers AI processing, sub-processors (Google, Neon, Vercel, Stripe, Anthropic), retention, contact.
- ✅ **Terms** (`/terms`) — eligibility, plans/credits/billing, acceptable use, content ownership, AI output disclaimer, **no-legal-advice carve-out**, warranty disclaimer, liability cap (lesser of 12mo fees or $100), indemnity.

### Shared chrome
- ✅ `app/(marketing)/layout.tsx` wraps Navbar + main + Footer.
- ✅ Sticky pill `Navbar` with route-active styling via `usePathname`; primary "Open app" CTA → `/app`.
- ✅ `Footer` with route links, privacy/terms, contact email, umbrella link.
- ✅ Fixed `SilkBackground` behind everything (lives in root layout).

### Animations
- ✅ Three card thumbnails on home (`ProposalMock`, `RfpMock`, `ContractMock`) auto-replay every 5.5–6.8s and replay instantly on hover; each has continuous micro-motion (total bar shimmer, check pop, mark highlight pulse, sparkle twinkle).
- ✅ `Showcase` on home hero — manual tabbed container holding the three interactive demos.
- ✅ `TaskMarquee` — dual-direction infinite scroll of tasks Rufus handles.
- ✅ `CountUp` — animates on in-view, e.g. 6 wks → 1 day, 120+ Qs, 100% sourced.
- ✅ `Reveal` — `whileInView` scroll-reveal wrapper used across sections.

### SEO
- ✅ `app/sitemap.ts` covers all marketing routes (home, proposals, rfp, contracts, pricing, about; privacy/terms can be added).
- ✅ `app/robots.ts` allows all crawling, points to sitemap.
- ✅ Per-page `metadata` with title templates.
- ❌ Open Graph images (relies on default).

---

## 2. Authentication & sign-in

### Stack
- ✅ NextAuth v5 (`next-auth@5.0.0-beta.31`) with Google provider.
- ✅ JWT session strategy — **no Drizzle adapter** (hard lesson: DB sessions deadlock on first sign-in because tables need user, user needs tables).
- ✅ Config at `auth.ts` at repo root. Exports `{ handlers, auth, signIn, signOut }`.
- ✅ Route handler at `app/api/auth/[...nextauth]/route.ts` re-exports `handlers`.
- ✅ Custom sign-in page at `/signin` (Google button via NextAuth server action), `pages.signIn` config points to it.
- ✅ Sign-out via `next-auth/react`'s `signOut({ callbackUrl: "/" })` in the sidebar.

### Flow
1. Anonymous user clicks "Open app" → redirected to `/signin`.
2. Google OAuth handshake.
3. NextAuth callback creates a JWT with `email`, `name`, `picture` claims.
4. On first authenticated API call, `ensureUserAndWorkspace()` (in `lib/db/queries.ts`):
   - SELECT user by email; if missing, INSERT user.
   - SELECT workspace by ownerId; if missing, INSERT workspace with default values, **grant 20 free credits with a ledger entry** ("Free plan starting credits").
   - Always lookup by **email**, never by `token.sub` (hard lesson — token sub doesn't map to DB user id).
5. AppShell checks `onboardingCompletedAt`; if null, redirects to `/app/onboarding`.

### Env
- `AUTH_SECRET` (or `NEXTAUTH_SECRET`) — JWT signing key.
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — Google OAuth client.
- `NEXTAUTH_URL` (production) — `https://rufus.exposql.com`.
- Authorized redirect URI on Google Cloud must be exactly `https://rufus.exposql.com/api/auth/callback/google`.

---

## 3. Onboarding wizard

Route: `/app/onboarding`. Four steps. Required before the rest of the app
unlocks (`AppShell` redirects here if `profile.onboardingComplete === false`).

### Steps
1. **Company** — Company name (required to continue), Website.
2. **Focus** — Industry (required), Typical client type.
3. **Services** — Tag-style input; press Enter to add. At least one required.
4. **Defaults** — Default currency (chip group: USD/EUR/GBP/CAD/AUD), Default proposal tone (chip group: Formal/Friendly/Concise).

### Persistence
- ✅ Each `Continue` button is non-destructive (PATCH on the final step via `completeOnboarding`).
- ✅ "Finish" PATCHes the workspace with `onboardingComplete: true` (sets `onboardingCompletedAt` server-side), then `router.push('/app')`.
- ✅ Standalone full-bleed layout — AppShell skips its sidebar/topbar when pathname === `/app/onboarding`.

### Polish
- ✅ Progress bar at top, animated fill per step.
- ✅ AnimatePresence slide transitions between steps.
- ❌ "Import from website URL" (scrape About page to prefill industry/services).
- ❌ Team-mate invite step.

---

## 4. Dashboard

Route: `/app`. The landing screen after sign-in.

### Sections
- ✅ Greeting using `profile.companyName.split(" ")[0]` with `"there"` fallback for empty profiles.
- ✅ **Stat tiles (4):** Plan, Credits remaining, Proposals count, RFPs · Contracts counts.
- ✅ **Quick actions (4):** New proposal, Answer an RFP, Review a contract, Add knowledge — each linking to the relevant tool.
- ✅ **Recent items list** — pulled from `/api/workspace`'s `recent` array (proposals + rfp_responses + contract_reviews merged + sorted desc by updatedAt). Each row links to the corresponding `/app/.../[id]` view page.
- ✅ **Knowledge base nudge** — count of entries, "Manage knowledge" button.
- ✅ Empty state on Recent: "Nothing here yet — start a proposal or paste an RFP."

---

## 5. Knowledge base

Route: `/app/knowledge`. The library that powers RFP answering and informs
Proposals.

### List
- ✅ Card grid (sm:grid-cols-2).
- ✅ Search box (case-insensitive substring match against title + body).
- ✅ Tag filter chips (All + each unique tag).
- ✅ Each card shows title, 3-line body excerpt, tags, relative updated-at.
- ✅ Hover reveals edit + delete icons.
- ✅ Empty state with friendly nudge.

### CRUD (server-backed)
- ✅ `GET /api/knowledge` — list workspace entries.
- ✅ `POST /api/knowledge` — create. Server-enforces **3-entry cap on free plan** (returns 402 with `error: "free_plan_knowledge_cap"`).
- ✅ `PATCH /api/knowledge/[id]` — update title/body/tags.
- ✅ `DELETE /api/knowledge/[id]` — delete.
- ✅ Frontend uses optimistic updates with rollback on server error.

### AI import
- ✅ "Import" button opens modal: paste-large-text → "Split & import".
- ✅ Calls `POST /api/ai/knowledge-import` (Claude-backed — `lib/ai/knowledge.ts` has the prompt).
- ✅ Cost: 2 credits per detected entry. Pre-deducted using rough estimate (paragraph count), then reconciled (refund if fewer entries, top-up if more, tolerated if user can't afford the top-up).
- ✅ Respects the free-plan 3-entry cap server-side; surplus entries are silently dropped (the UI shows "X of Y inserted").
- ✅ Returns inserted/detected/skipped counts; modal shows the result for ~1.4s then closes.
- 🟡 Surfacing the 402 cap error on the **regular add modal** (not the import modal) — currently the AppProvider silently rolls back the optimistic insert.

---

## 6. RFP autopilot

Routes: `/app/rfp` (compose), `/app/rfp/[id]` (saved response).

### Compose page (`/app/rfp`)
- ✅ Textarea (one question per line). Sample populated by default.
- ✅ Per-question cost via `rfpQuestionCost(q)`: 2 (≤80 chars), 3 (≤180), 4 (>180). Total shown live.
- ✅ Empty-KB warning panel — blocks the Auto-answer button and links to `/app/knowledge`.
- ✅ "Recent responses" panel showing last 5 saved RFPs with links to `/app/rfp/[id]`.
- ✅ Auto-answer → calls `POST /api/ai/rfp`.
- ✅ While AI is working: animated equaliser bars + "Drafting answers from your knowledge base…".
- ✅ Result cards: question + answer + confidence chip + source title (resolved from KB by id) + editable textarea + Approve toggle + Re-answer button.
- ✅ **+ Add fact to knowledge base** button — surfaces when `sourceEntryId === null`, prefills a KB entry with the question.
- ✅ Copy-all button — concatenates `Q: ...\nA: ...` lines.
- ✅ "Saved · Open as page" green panel appears after success.
- 🟡 Edits & approvals on the compose page are local-only (the next compose run discards them). They're persisted only via the `/app/rfp/[id]` view.

### Saved view (`/app/rfp/[id]`)
- ✅ Loads via `GET /api/rfp/[id]`.
- ✅ Same card UI as compose result.
- ✅ Edits autosave with a 700ms debounce → `PATCH /api/rfp/[id]` with the full answers array.
- ✅ Approve toggle autosaves.
- ✅ Re-answer one → hits the AI endpoint with the single question, replaces that card, refreshes credits.
- ✅ Copy-all.

### API & AI
- ✅ `POST /api/ai/rfp` — body `{ text }`:
  1. Auth, workspace lookup, KB load.
  2. 422 if KB is empty.
  3. Cost = sum of `rfpQuestionCost` over each line.
  4. Atomic `spendCredits()`; 402 if insufficient.
  5. `answerRfp()` in `lib/ai/rfp.ts` calls Claude with: system prompt instructing to ground in KB and flag unknowns; cached ephemeral block holding the workspace profile + all KB entries; user message with numbered questions.
  6. Parse JSON, defensive normalisation, validate `sourceEntryId` against real entry ids.
  7. INSERT `rfp_response` row.
  8. On any AI exception: `grantCredits(... "refund")`, return 502.
- ✅ `GET /api/rfp` — list workspace's RFP responses.
- ✅ `PATCH /api/rfp/[id]` — title, answers array, status.
- ✅ `DELETE /api/rfp/[id]`.

### AI prompt strategy
- ✅ Prompt caching ON for `profile + KB` block (huge win: question 2+ in the same session is ~$0.0015 cache read instead of ~$0.015 cold input).
- ✅ Claude instructed to return JSON-only; defensive fence-stripping in `parseJsonBlock`.
- ✅ Claude instructed to set `confidence: low` and `sourceEntryId: null` when no entry supports the answer rather than invent.

---

## 7. Contract review

Routes: `/app/contracts` (compose), `/app/contracts/[id]` (saved review).

### Compose page
- ✅ Big textarea (mono font) prepopulated with a sample contract.
- ✅ Cost calc: `clamp(10 + len/2500, 10, 30)`.
- ✅ 60,000-char hard cap with a rose-coloured warning.
- ✅ "Recent reviews" panel (top 5 saved) with links.
- ✅ Review button → `POST /api/ai/contract`.
- ✅ Result: tabs Summary / Red flags / Suggested edits, with `motion.layoutId` animated pill on the active tab.
- ✅ Summary: bulleted plain-English points.
- ✅ Red flags: severity chip (high/medium/low) + quoted clause + reason.
- ✅ Suggested edits: original (strikethrough) + replacement + reason + Copy button.
- ✅ "Saved · Open as page" emerald panel.
- ✅ **"Ask about this contract"** follow-up box — calls `POST /api/ai/contract/followup` with the contract text + question; uses cache_control: ephemeral on the contract block. Answer rendered as a card with the question + cost chip + the response.
- ✅ Follow-up cost: 3 (≤70 chars), 4 (≤160), 5 (>160).
- ❌ PDF/DOCX upload (currently paste-only).
- ❌ Long-doc splitter (currently hard-caps at 60k chars).

### Saved view (`/app/contracts/[id]`)
- ✅ Same three tabs + a **Source** tab when `sourceText` is stored.
- ✅ Follow-up box works (uses saved sourceText).
- 🟡 Follow-ups are not persisted to DB (lost on refresh of the [id] page). Each page-load starts a fresh follow-up list.

### API
- ✅ `POST /api/ai/contract` — `body { text, fileName? }` → review + persist to `contract_review` row.
- ✅ `POST /api/ai/contract/followup` — body `{ text, question }` → plain-text answer, no persistence.
- ✅ `GET /api/contracts` — list workspace's reviews.
- ✅ `GET /api/contracts/[id]`.
- ✅ `DELETE /api/contracts/[id]`.
- ❌ `PATCH /api/contracts/[id]` (renaming, persisting follow-ups, etc.) — not implemented; review is read-only after creation.

### AI prompt strategy
- ✅ System prompt: plain-English, never legal-advice, rank red flags by severity, quote clauses verbatim, propose concrete edits.
- ✅ Contract text sent as `cache_control: ephemeral` content block → follow-ups against the cached contract are dramatically cheaper.

---

## 8. Proposal generator + editor + hosted page

The flagship customer-perceived flow. Three connected surfaces.

### New (`/app/proposals/new`)
- ✅ Form: client name, project title, scope (textarea), timeline, tone (chips), editable pricing table (`PricingEditor` shared component).
- ✅ Cost: `clamp(12 + scope/200, 12, 20)`.
- ✅ Generate → `POST /api/ai/proposal` → on success `router.push('/app/proposals/{id}')`.
- ✅ Error states surfaced inline with friendly messages.

### Editor (`/app/proposals/[id]`)
- ✅ Loads via `GET /api/proposals/[id]`.
- ✅ Status dropdown (draft / sent / won / lost) — autosaves via PATCH.
- ✅ Export PDF / DOCX buttons — currently toast "PDF export coming soon" (❌ not implemented).
- ✅ **Publish** button — `PATCH /api/proposals/[id]` with `{ publish: true }` → server generates a slug from `clientName-title-XXXX` (4-char random suffix for uniqueness), sets `hostedSlug`, flips status to `sent`.
- ✅ Hosted-link panel appears once published: URL, Open button, Copy button.
- ✅ Shows **"Opened {date}"** when `viewedAt` is set (client has opened the hosted page).
- ✅ Each of the 7 sections in its own Panel with a textarea (autosaves on every keystroke, 700ms debounce).
- ✅ Per-section Regenerate button shows the section-specific cost (4/5/6 via `proposalSectionCost`) — heavy sections (Scope/Deliverables/Pricing) cost 6, light (Terms/Next steps) cost 4, others 5.
- ✅ Regenerate calls `POST /api/ai/proposal` with `regenSectionOnly: key`; server uses saved scope/timeline/tone from the proposal row (the schema gained those columns in migration 001).
- ✅ Pricing section uses `PricingEditor` — line items, qty, price, total. Autosaves on every change.
- ✅ Bottom toast for transient messages (Regenerated X · 4cr, Hosted link published, etc.).

### Hosted public page (`/p/[slug]`)
- ✅ Server component, no client auth required, `robots: noindex`.
- ✅ Branded header: workspace logo (if set, otherwise initials chip) + company name + status badge.
- ✅ Hero: "Prepared for {client}" + project title + accent-coloured underline.
- ✅ Sections rendered in canonical order: Overview, Objectives, Scope of work, Deliverables, Timeline, then pricing table, then Terms, Next steps.
- ✅ Pricing table: full HTML table with line items, total row in workspace primary colour.
- ✅ Brand colours (`primaryColor`, `accentColor`) applied as CSS variables on the page root + inline styles on key elements.
- ✅ Footer: "Reach out to {workspace} to approve or discuss" + "Powered by Rufus".
- ✅ View tracking: `<TrackView />` client component fires `POST /p/[slug]/track` on mount; server sets `viewedAt` only if it's null (idempotent, reload-safe).
- ❌ E-sign capture (the page is read-only; no accept-and-sign flow).

### List (`/app/proposals`)
- ✅ `GET /api/proposals` returns workspace's proposals.
- ✅ Each row is a clickable card linking to `/app/proposals/[id]`, shows client + title + relative updated-at + status chip.
- ✅ Empty state with "Create your first proposal" CTA.

### API
- ✅ `POST /api/ai/proposal` — supports both full generation and `regenSectionOnly`.
- ✅ `GET /api/proposals` — list.
- ✅ `GET /api/proposals/[id]`.
- ✅ `PATCH /api/proposals/[id]` — accepts clientName, title, sections, pricing, status, and the `publish: true` flag.
- ✅ `DELETE /api/proposals/[id]`.

### AI prompt strategy
- ✅ System prompt instructs Claude to write in tone, refer to company by name, be specific, never invent numbers/dates/commitments.
- ✅ `cache_control: ephemeral` on the workspace profile + KB block → section regen is cheap.
- ✅ For `regenSectionOnly`, a focused system prompt asking for a single-key JSON response.

### Missing
- ❌ Tiptap rich-text editor — currently plain textareas.
- ❌ PDF/DOCX export of the proposal.
- ❌ Brand colours don't apply to the **editor** preview yet (only to the public `/p/[slug]` page).
- ❌ Per-section "tone-shift" inline AI actions (rewrite formal/friendly/concise selection).

---

## 9. Brand kit

Lives in the workspace row + applied on the public proposal page.

### Settings UI (`/app/settings` → Brand tab)
- ✅ Logo: text input for URL + preview thumbnail. (❌ No file upload via Vercel Blob yet.)
- ✅ Primary colour swatches (6 presets) + hex input.
- ✅ Accent colour swatches + hex input.
- ✅ Theme chips (Light / Warm / Bold) — currently stored but not yet differentiated in the hosted page renderer.
- ✅ All PATCH `/api/workspace` on change.

### Applied to
- ✅ Hosted proposal `/p/[slug]` — header logo, accent underline, pricing total row, CSS variables on the root.
- ❌ The in-app editor preview.
- ❌ PDF exports (when those exist).
- ❌ Email notifications (when those exist).

---

## 10. Settings & billing

Route: `/app/settings`. Two tabs: Brand kit, Billing & credits.

### Brand tab — see [§9](#9-brand-kit).

### Billing tab
- ✅ Current plan tile + credit meter (filled bar + numeric).
- ✅ Plan upgrade buttons: Starter / Growth / Scale. Each POSTs `{kind: "subscription", key: "starter|growth|scale"}` to `/api/stripe/checkout` → response URL → browser redirects to Stripe Checkout.
- ✅ Buy credit packs (4 cards: 100/300/750/2,000). Each POSTs `{kind: "pack", key: "pack100|..."}` → Stripe Checkout.
- ✅ Credit ledger — last 10 entries with reason + relative time + signed delta.
- ✅ Empty-ledger state.
- ❌ Stripe Customer Portal link for self-serve cancel/update card (explicit skip per user — Stripe management deferred).
- ❌ Invoices list / receipt download.
- ❌ "Out of credits" inline upgrade nudge.

---

## 11. Admin panel

Route: `/app/admin`. Gated by `isAdmin(session.user.email)` checking
`ADMIN_EMAILS` (comma-separated env var, case-insensitive match).

### Top-level (`/app/admin`)
- ✅ **8 stat tiles:** Users · Workspaces · Paid subscribers · Lifetime revenue (USD) · Credits granted total · Credits used total · Pack purchases · Knowledge entries.
- ✅ **Plan breakdown:** count of workspaces on each plan.
- ✅ **Grant credits form:** email + credits + reason → POST `/api/admin/grant`. Looks up the workspace by owner email, calls `grantCredits()`, ledger entry attributed to the admin's email.
- ✅ **Recent users (10):** name/email/plan chip/created-at. Each row links to `/app/admin/workspaces/[id]`.
- ✅ **Recent pack purchases (10):** credits/pack/workspace/USD amount/time.
- ✅ **Recent ledger activity (15):** cross-workspace, with signed delta.

### Workspace deep-dive (`/app/admin/workspaces/[id]`)
- ✅ 8 stat tiles for that workspace (plan, credits balance/used/bought, kb/proposals/rfps/contracts counts).
- ✅ Workspace info: id, website, industry, Stripe customer/sub IDs, sub status.
- ✅ Per-workspace grant credits form (pre-scoped to that owner's email).
- ✅ Pack purchases list for that workspace.
- ✅ Full ledger for that workspace (last 20).
- ❌ Drill into individual proposals/RFPs/contracts of that workspace.
- ❌ Send a workspace-scoped email or notification.
- ❌ Ban / disable account.

### API
- ✅ `GET /api/admin/stats` — admin-only.
- ✅ `POST /api/admin/grant` — admin-only.
- ✅ `GET /api/admin/workspaces/[id]` — admin-only.
- ❌ CSV export endpoints.

### Sidebar visibility
- ✅ Admin link only renders when `isAdmin === true` from the workspace API.
- ✅ Server enforces forbidden on all `/api/admin/*` endpoints; client-side hiding is cosmetic.

---

## 12. Credit system

The model is fully implemented; numbers all live in `lib/pricing.ts`.

### What costs what
| Action | Credits |
|---|---|
| Generate a proposal | 12–20 (by scope length) |
| Regenerate one proposal section | 4–6 (by section weight) |
| Answer an RFP question | 2–4 (by length, fresh & re-answer) |
| Review a contract | 10–30 (by document length) |
| Ask a follow-up on a contract | 3–5 (by length) |
| Re-run a contract section | 5–8 (listed in pricing, not wired in UI) |
| AI knowledge import | 2 per detected entry |
| Editor side-panel assistant | 2–4 (listed, ❌ not implemented) |
| Inline AI edit | 1 (listed, ❌ not implemented) |

### Atomic spend pattern (`lib/db/queries.spendCredits`)
1. SELECT workspace credits.
2. Check `total = creditsIncluded + creditsBought - creditsUsed` ≥ amount.
3. If not, return `{ ok: false, remaining }`.
4. UPDATE `creditsUsed += amount` + INSERT ledger entry with negative delta.

### Refund pattern (`grantCredits` with `source: "refund"`)
- Called from every AI endpoint's catch block.
- Adds back to `creditsBought` (which is fine since the lookup sums all three).
- Ledger entry with positive delta and `reason: "Refund: ..."`.

### Free plan starting balance
- Granted to new workspaces in `ensureUserAndWorkspace()`: 20 credits, ledger entry "Free plan starting credits."
- The user must complete onboarding before spending them.

---

## 13. AI integration layer

### Stack
- `@anthropic-ai/sdk` v0.99.x.
- Default model: `claude-sonnet-4-6` (env override via `ANTHROPIC_MODEL`).
- All AI work is server-side only.

### Module structure
- ✅ `lib/ai/anthropic.ts` — lazy client, `extractText()`, `parseJsonBlock()`.
- ✅ `lib/ai/rfp.ts` — `answerRfp({workspace, knowledge, questions})`. Returns `RfpAnswer[]`.
- ✅ `lib/ai/proposal.ts` — `generateProposal({workspace, knowledge?, client, title, scope, timeline, pricingRows, tone, regenSectionOnly?})`. Returns `Record<SectionKey, string>`.
- ✅ `lib/ai/contract.ts` — `reviewContract({contractText, fileName?})` and `askContractFollowup({contractText, question})`.
- ✅ `lib/ai/knowledge.ts` — `splitIntoEntries(text)`. Returns `{title, body, tags}[]`.

### Routes (all dynamic, nodejs runtime, `maxDuration: 60-90s`)
- ✅ `POST /api/ai/rfp`
- ✅ `POST /api/ai/proposal`
- ✅ `POST /api/ai/contract`
- ✅ `POST /api/ai/contract/followup`
- ✅ `POST /api/ai/knowledge-import`
- ❌ `POST /api/ai/edit` (inline editor rewrite/shorten/formal/friendly) — not implemented; cost listed in pricing.

### Prompt caching
- ✅ ON for: workspace profile + KB block (RFP, proposal, KB import), contract text (review + follow-up).
- The first call writes the cache (~1.25× input cost); every subsequent call in the cache window reads it at ~$0.30/Mtok instead of $3/Mtok.
- This is why follow-ups and section regens are economically viable.

### Failure handling
- Every AI endpoint pre-deducts credits → calls AI → on success persists + returns → on exception refunds and returns 502.
- This means **the user is never charged for a failed generation**.

### Env
- `ANTHROPIC_API_KEY` — required.
- `ANTHROPIC_MODEL` — optional override.

---

## 14. Stripe integration

### Account
Stripe account `acct_1TZu9cDs5O82YiC2` ("Exposql Checklist"). Products and
prices live there. Full ID table in [`PRICING.md`](./PRICING.md#7-live-stripe-ids).

### Checkout (✅ built)
- `POST /api/stripe/checkout` — body `{ kind: "subscription"|"pack", key: ... }`.
- Auth → workspace lookup → ensure Stripe customer (create if missing, save `stripeCustomerId`) → create Checkout Session with `metadata: { workspaceId, planKey or packKey + credits }` → return `url` for client redirect.
- For packs: record a pending `credit_purchase` row keyed by `stripeSessionId`.

### Webhook (✅ built)
- `POST /api/stripe/webhook` — verifies signature, switches on `event.type`:
  - `checkout.session.completed` (payment mode) → mark purchase completed + `grantCredits` for the pack credits.
  - `checkout.session.completed` (subscription mode) → set plan, sub id, status = active, `creditsIncluded = monthly`, grant the monthly credits.
  - `invoice.payment_succeeded` → recurring renewal — refresh `creditsIncluded`, **reset creditsUsed to 0**, grant monthly credits.
  - `customer.subscription.updated` / `customer.subscription.deleted` → update `subscriptionStatus`, revert plan to `free` if not active.

### Env
- `STRIPE_SECRET_KEY` (live key for prod, test key for non-prod).
- `STRIPE_WEBHOOK_SECRET` — per-endpoint signing secret.
- 7 `STRIPE_PRICE_*` env vars are **optional** — the IDs are hardcoded in `lib/stripe.ts`; env vars are only for swapping to test mode.

### Multi-product Stripe account
Each product (Rufus, future ExpoSQL apps) gets its own webhook endpoint with
its own `whsec_`. The Rufus webhook is defensive: it ignores events whose
metadata doesn't contain a Rufus `workspaceId`, and price-ID lookups only
match the seven Rufus prices.

### Missing
- ❌ Customer Portal (cancel/manage). Explicit deferral.
- ❌ Invoices list / receipt download.

---

## 15. Document I/O — uploads & exports

| Capability | Status |
|---|---|
| Paste-text input on every tool | ✅ |
| PDF upload for contract review | ❌ |
| DOCX upload for contract review | ❌ |
| PDF export of proposal | ❌ |
| DOCX export of proposal | ❌ |
| PDF export of contract review | ❌ |
| Logo upload via Vercel Blob | ❌ (URL field works) |

Approach when this lands:
- For PDF parsing: either `pdf-parse` server-side, or pass the file as a
  Claude document block (Claude's Messages API supports PDF natively, ~3.5x
  input token cost vs raw text).
- For DOCX parsing: `mammoth` extracts text.
- For PDF export: probably `@react-pdf/renderer` since we control the layout
  (server-side render at the request boundary).

---

## 16. Notifications

Status: ❌ Not started.

When wired (likely Resend):

- **Welcome email** on first sign-in.
- **"Your proposal was opened"** when `viewedAt` first sets on a hosted proposal.
- **"You're out of credits"** when `remaining` hits 0.
- **Receipt** after a Stripe pack purchase.
- **Plan-change confirmation** after a subscription change.

Env when added: `RESEND_API_KEY`, `EMAIL_FROM`.

---

## 17. Analytics

Status: ❌ Not started.

When wired:
- GA4 + GTM in `app/layout.tsx` (root) so it covers marketing + app.
- Events to track: `signup_complete`, `onboarding_complete`,
  `kb_entry_added`, `rfp_generated`, `proposal_generated`,
  `contract_reviewed`, `checkout_started`, `checkout_completed`,
  `pack_purchased`.

Env when added: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`.

---

## 18. Pending features queue

Priority order if/when we pick this back up:

1. **Cancel-subscription / Customer Portal** — *explicit defer per user, listed here for completeness.*
2. **PDF + DOCX upload** for contract review.
3. **PDF export** for proposals (and contract reviews).
4. **Tiptap rich-text editor** for proposal sections.
5. **Logo upload via Vercel Blob.**
6. **Brand colours applied to the in-app editor preview** (currently only hosted page).
7. **Free-plan KB cap UX** on the regular add modal (the import modal is already correct).
8. **Inline AI edit endpoint** (`/api/ai/edit`) + selection-aware UI in the proposal editor.
9. **Editor side-panel assistant** (the 2–4cr action listed in pricing).
10. **Email notifications** (Resend).
11. **GA4 + GTM analytics.**
12. **Admin: CSV export, drill into individual workspace items.**
13. **Contract follow-ups persisted** (currently per-session).
14. **Long-doc contract splitter** (currently capped at 60k chars).
15. **Annual plans** (currently monthly recurring only).
16. **E-sign capture** on the public proposal page (or integrate a signing provider).
