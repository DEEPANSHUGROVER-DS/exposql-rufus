# Rufus — product description

This file captures **what Rufus is**, who it's for, how it positions itself,
and the brand/voice rules that anything we build needs to follow. It is the
canonical answer to "what are we building?"

If a session crashes mid-task and you're catching up, read this first, then
[`FEATURES.md`](./FEATURES.md), then [`STATUS.md`](./STATUS.md).

---

## 1. Identity

**Name:** Rufus
**Tagline:** *Win the work, then close it — your document AI.*
**Domain:** rufus.exposql.com
**Umbrella:** A product of **ExpoSQL AI Labs**, alongside other focused AI products at [exposql.com](https://exposql.com).

Rufus is a **standalone product**: its own database, own Google OAuth client,
own Stripe account ("Exposql Checklist" — `acct_1TZu9cDs5O82YiC2`), own
domain, own analytics. The umbrella relationship is purely brand
("An ExpoSQL AI Labs product") with a footer link to exposql.com. Nothing is
shared with sibling products at the data layer.

---

## 2. What Rufus is, in one sentence

> Rufus is an AI workspace that takes the slow, repetitive document work — proposals, RFP & security questionnaires, and contract review — off the plates of agencies, consultants, and B2B sales teams, so they can spend their time on the deals themselves.

The repeating phrase across the site: **"the documents that win and close business."**

- Proposals & SOWs → *win* the work
- RFPs & questionnaires → also *win* the work (and prove you can be trusted)
- Contracts → *close* the work (without signing something you'll regret)

---

## 3. The three tools

Each tool is its own product surface inside the same workspace. They share
the workspace profile, knowledge base, brand kit, and credit balance.

### 3.1 Proposals & SOWs — *for agencies & consultants*

User fills a short form (client, project title, scope, editable pricing
table, timeline, tone). Rufus drafts a **sectioned proposal** in the
workspace's tone, applies the brand kit live, and produces an
**e-sign-ready** output. The user can edit any section manually, regenerate
one section at a time, change pricing line items, mark status
(draft/sent/won/lost), and **publish a hosted public URL** the client can
open without an account. Rufus tracks **when the client first opens it**.

Default sections (the AI returns exactly these keys, in order):
**Overview · Objectives · Scope of work · Deliverables · Timeline · Terms · Next steps**

The pricing table is rendered separately from the AI-generated prose — line
items, quantity, unit price, total. Currency comes from the workspace.

### 3.2 RFP & questionnaire autopilot — *for sales teams*

User pastes an RFP or security questionnaire (one question per line, or a
free-form paste). Rufus detects each question, then for each question:

1. Reads the workspace's **knowledge base** (cached in the prompt for
   efficiency).
2. Picks the single best source entry.
3. Drafts a tone-matched answer **grounded in that source**.
4. Returns: `{ question, answer, confidence: high|medium|low, sourceEntryId }`.

The output renders as cards: question + answer + confidence chip + source
entry name + an editable textarea (edits autosave) + **Approve** toggle +
**Re-answer · 2-4cr** button + **Add fact to knowledge base** when no source
was found.

This is the **strongest demo** and depends on the knowledge base existing.
If the KB is empty the tool blocks and prompts the user to add entries
first.

### 3.3 Contract review — *for founders & ops*

User pastes a contract (up to 60,000 chars). Rufus returns three things in
tabs:

- **Plain-English summary** — what the contract actually says, section by section, 3–6 bullets.
- **Red flags** — each with a severity (high/medium/low), the quoted clause, and a one-sentence reason. High = unbounded liability, long-notice auto-renew, broad IP assignment, one-sided termination. Medium = ambiguous obligations, inconvenient jurisdiction. Low = stylistic concerns.
- **Suggested edits** — each shows the original phrase, a proposed replacement, and a one-line reason. The user can copy any edit into their redline.

Below the tabs is an **"Ask about this contract"** follow-up box. The
contract is cached in Claude's prompt cache so follow-ups are 3–5 cr — much
cheaper than a fresh review (10–30 cr).

**Framing rule — non-negotiable:** every output is "for your review." Never
"legal advice." The CTA copy and Terms of Service explicitly state Rufus is
not a law firm.

---

## 4. Brand voice & rules

### 4.1 Core values

- **Genuinely useful, AI-forward.** We build products that take slow, manual work off your plate so your business can scale — not demos that look clever and stall.
- **Honest by default.** Never invent facts. RFP answers cite their source. Contract review is framed as for your review, never legal advice.
- **Calm and premium.** The work is high-stakes; the tool should feel composed. Clean drafts, clear pricing, exports that look like you.

### 4.2 Voice rules

- Confident but not breathless. We're shipping useful AI, not the singularity.
- Plain language. No legalese. No "blockchain-grade" superlatives.
- Specific over generic. "12 weeks → 1 day to draft a proposal" beats "10x faster."
- One italic accent word per heading, in the serif (Instrument Serif). That's the signature.

### 4.3 What we never say

- "Legal advice." We say **"for your review."**
- "Lawyer," "attorney," "legal opinion." We say **"contract review," "red flags," "plain-English summary," "suggested edits."**
- "Unlimited." Nothing in this product is unlimited — every AI action costs credits.
- "Free forever." The free plan is **one task** (one proposal *or* one contract review), one-time credits, watermarked outputs.
- "We'll never charge you" or similar. Be explicit about pricing up front.

### 4.4 What we *do* say

- "Your knowledge base" (the user owns it).
- "Drafted for your review."
- "Sourced from your knowledge base" / "Source: Security overview".
- "No source found — please review and add this fact" (when confidence is low).
- "For your review — not legal advice." (Footer on every contract review output.)
- "Manual editing is always free." (Recurring marketing line — it's true and it's a real moat against pure token-counting competitors.)

---

## 5. Target customers

### 5.1 Agencies & consultants
**Primary tool:** Proposals & SOWs.
**Why:** They send proposals constantly. Every minute saved on drafting compounds. They care about brand presentation and a clean pricing table.
**Plan they'll buy:** Starter ($39) for solos, Growth ($99) when they're sending enough that brand kit + hosted links matter.
**Marketing surface:** `/proposals` page on the marketing site.

### 5.2 B2B sales teams
**Primary tool:** RFP autopilot.
**Why:** Filling a 50-question security questionnaire is 2–3 days of work for a sales engineer. Rufus does the first pass in 30 seconds and saves your answers as reusable knowledge. The willingness to pay is high — RFPs gate revenue.
**Plan they'll buy:** Growth ($99) and up; large teams hit Scale ($249).
**Marketing surface:** `/rfp` page on the marketing site.

### 5.3 Founders, COOs, ops people
**Primary tool:** Contract review.
**Why:** Every contract is "I'm not a lawyer, but I need to sign this today." Rufus surfaces the 3–5 things they actually need to push back on. Re-engagement happens whenever a new contract arrives.
**Plan they'll buy:** Starter ($39) — usage is bursty, packs work well.
**Marketing surface:** `/contracts` page on the marketing site.

### 5.4 Anti-personas

- **Law firms.** Rufus is not a substitute for counsel. We won't market to lawyers.
- **Enterprise procurement** (the buyers of RFPs, not the responders) — not our user.
- **Pure tinkerers/students.** They love free tiers but never pay. We deliberately tightened the free plan to one task to discourage indefinite freeloading.

---

## 6. Positioning vs. alternatives

| Alternative | What Rufus does differently |
|---|---|
| Generic ChatGPT prompting | KB-grounded answers with cited sources, never invents, persists every response, has a real workspace + brand kit. |
| "Bigger" all-in-one platforms (PandaDoc, Proposify, Conga) | Lighter, AI-first, much cheaper, three focused tools instead of a sprawling suite. |
| Lawyers / paralegals (contract review) | Plain English in seconds, $1–3/contract, surfacing the same 3–5 things a junior lawyer would flag — without trying to *be* a lawyer. |
| Specialist RFP tools (Loopio, Responsive) | We're 10–20x cheaper, faster onboarding (a few KB entries, not a vendor selection process), and bundle proposals + contracts in the same workspace. |

The product wedge is the **shared workspace + brand kit + credit balance**
across all three tools. Once you're using Rufus to draft a proposal, the
marginal cost of using it for an RFP later is zero workflow friction.

---

## 7. Pricing principle (full detail in [`PRICING.md`](./PRICING.md))

Two unshakeable rules:

1. **Nothing is unlimited.** Every AI action spends credits. No "Pro" plan with infinite generations. This is non-negotiable — it's how we don't get burned by token costs.
2. **Charged credit price >> token cost** on every action. 1 credit ≈ $0.10 retail, ~$0.012 token COGS → ~8x markup on the cheapest action, 20x+ on proposals. Gross margin stays ~85%+ even on the most cost-heavy actions.

**Free plan is deliberately tight.** 20 credits one-time. Enough for one
proposal *or* one contract review. Outputs watermarked. KB capped at 3
entries. Anyone who needs more upgrades to Starter ($39).

**Manual editing is always free.** It's the "feels generous" lever that
costs us nothing (no tokens spent).

---

## 8. Design system

Cream + ink + silk pastel palette. Editorial. Continuous subtle motion.

### Palette
- `paper` cream backgrounds (#F4F0E8, with 50/100/200/300 shades)
- `ink` text — 900 default (#1B1A16), 700, 500, 400 muted
- `silk` pastel accents — lavender, periwinkle, sky, mint, blush, peach
- `accent` indigo for the italic serif word (#5b5bd6)

### Type
- **Plus Jakarta Sans** — UI sans-serif
- **Instrument Serif** — italic accent for the signature word in headings
- Headings: `font-semibold tracking-[-0.02em] leading-[1.12]`
- One italic-serif word per heading; that's the signature. e.g. *"Win the work, then **close it** — your document AI."*

### Motion
- Framer Motion everywhere.
- Continuous subtle motion: floating silk blobs in the background (`SilkBackground`), shimmer sweeps on cards (`shimmer-sweep`), animated marquee strips, equaliser-bar waveforms while AI is working.
- Cards lift slightly on hover, icons rotate/scale, demos auto-replay every ~6s and replay on hover.

### Patterns
- `.btn-dark` / `.btn-soft` rounded-full buttons
- `.card` rounded 26px with subtle border + shadow
- `.chip` small rounded pill
- `.eyebrow` small caps-ish section label with a leading dot
- `.input` rounded text inputs with paper background + accent focus ring
- Fixed `SilkBackground` behind everything (skipped on `/p/[slug]` for a clean hosted-page look)

### Layout
- Container: `mx-auto w-full max-w-6xl px-5 sm:px-8`
- Sections: `py-24 sm:py-32`
- Page hero pad-top: `pt-36 sm:pt-44`

### Don't break the system
- Don't reach for new colours outside the palette.
- Don't use heavy serif outside the italic accent.
- Don't add animation that doesn't match the calm, slow pace.
- Don't introduce CSS-in-JS — Tailwind classes only.

---

## 9. Marketing site shape

Routes (under `app/(marketing)/`):

```
/              Home — hero (interactive showcase tabs), 3-tool overview cards, how-it-works, comparison count-up, FAQ, CTA
/proposals     Tool page — InteractiveProposal demo, features, how it works, FAQ, CTA
/rfp           Tool page — InteractiveRfp demo, features, how it works, FAQ, CTA
/contracts     Tool page — InteractiveContract demo, features, how it works, FAQ, CTA
/pricing       4 plans + 4 credit packs (toggle), per-action cost table, credits explainer
/about         "About / ExpoSQL AI Labs"
/privacy       Privacy policy (covers AI processing, sub-processors)
/terms         Terms of service (covers AI outputs, liability cap, no-legal-advice carve-out)
```

Plus the public hosted proposal at `/p/<slug>` (no marketing chrome — the
shell renders the workspace's brand colours and logo instead).

---

## 10. App URL shape

```
/signin                              Google sign-in
/app                                 Dashboard
/app/onboarding                      4-step workspace wizard (gates the app until done)
/app/knowledge                       KB list + CRUD + AI paste-to-split import
/app/proposals                       List of saved proposals
/app/proposals/new                   Form → generate → redirect to /app/proposals/[id]
/app/proposals/[id]                  Editor: sections + regen + pricing + publish
/app/rfp                             Compose + recent responses panel; inline result + "open as page" link
/app/rfp/[id]                        Reopened RFP response with edit + approve + re-answer
/app/contracts                       Compose + recent reviews panel; inline result + follow-ups
/app/contracts/[id]                  Reopened review with source tab + follow-ups
/app/settings                        Brand kit + billing (Stripe checkout)
/app/admin                           Admin panel (gated by ADMIN_EMAILS)
/app/admin/workspaces/[id]           Per-workspace deep-dive
```

---

## 11. Voice samples (use these verbatim where they fit)

- **Hero subhead:** "Rufus drafts branded proposals, answers RFPs and security questionnaires from your own knowledge base, and flags risky contract clauses in plain English. The slow, manual work, off your plate."
- **Contracts disclaimer:** "For your review — not legal advice."
- **Empty KB nudge:** "Your knowledge base is empty. Add a few entries first so Rufus has something to answer from."
- **No source flag (RFP):** "No source found in your knowledge base — please review and add this fact."
- **Free plan note:** "Free, one-time credits enough for one proposal or one contract review. No card required."
- **Pricing footer:** "Pricing is in draft for review — see PRICING.md for the margin model behind these numbers."
- **App footer / hosted page footer:** "Powered by Rufus" linking to rufus.exposql.com.
- **Umbrella footer link:** "An ExpoSQL AI Labs product →" linking to exposql.com.

---

## 12. The "every output should…" checklist

When designing any new AI-touching feature, every output it produces should:

1. **Be grounded** — cite a source from the user's KB, or flag the absence honestly.
2. **Match the workspace's tone** (Formal / Friendly / Concise).
3. **Be editable** — manual edits are free; the user is always the final author.
4. **Be persisted** — never throw away what Claude returned; the user should be able to reopen it.
5. **Show its cost up front and the actual amount after** — never surprise the user with a credit charge.
6. **Never claim to be legal advice** (contract tool).
7. **Never invent facts** (RFP tool especially, but everywhere).
