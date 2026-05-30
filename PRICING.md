# Rufus pricing strategy (draft for review)

Goal: a credit model where **every AI action costs money**, nothing is
unlimited, and the credit price always sits well above what the tokens
actually cost us — so gross margin is structural, not hoped-for.

All numbers live in `lib/pricing.ts` (single source of truth for the marketing
pricing page and the in-app credit meter). Change them there and both update.

---

## 1. What an AI action costs *us* (token COGS)

Assumes a Sonnet-class Claude model as the workhorse (quality matters for
proposals and contracts), **prompt caching on** for the knowledge base and for
uploaded contracts, and rough rates of **$3 / Mtok input, $15 / Mtok output,
$0.30 / Mtok cached read**.

| Action | Tokens (in / out) | Est. raw cost |
|---|---|---|
| Proposal generation | ~2k in / ~3k out | **~$0.05–0.08** |
| RFP answer (per question, KB cached) | ~0.7k in + 5k cached / ~0.25k out | **~$0.008–0.015** |
| Contract review (first pass, ≤15k doc) | ~15k in (cache-write) / ~3.5k out | **~$0.12–0.20** |
| Contract follow-up action (doc cached) | cached read / ~2k out | **~$0.04–0.06** |
| Inline edit (selected text) | ~0.6k in / ~0.3k out | **~$0.007** |

Worst-case **cost per credit of work ≈ $0.012** (including retries/overhead).
That single number is the floor everything else is priced against.

## 2. What we charge

**1 credit ≈ $0.10 of customer value.** Against ~$0.012 COGS that is an
**~8x markup on the cheapest action and 20x+ on proposals** — comfortably
absorbing the free tier, regenerations, Stripe fees (~2.9% + $0.30), and infra.

### Per-action credit cost (range shown before, actual deducted after)

| Action | Credits | ≈ Charged | ≈ Our cost | Margin |
|---|---|---|---|---|
| Generate a proposal | 12–20 | $1.20–2.00 | ~$0.06 | ~96% |
| Regenerate one section | 4–6 | $0.40–0.60 | ~$0.01 | ~96% |
| **RFP answer** | **2–4 / question** | **$0.20–0.40** | **~$0.008–0.02** | **~95%** |
| Review a contract | 10–30 | $1.00–3.00 | ~$0.12–0.30 | ~90% |
| Ask a follow-up on a contract | 3–5 | $0.30–0.50 | ~$0.02 | ~94% |
| Re-run a contract section | 5–8 | $0.50–0.80 | ~$0.05 | ~90% |
| AI import to knowledge base | 2 / entry | $0.20 | ~$0.01 | ~95% |
| Inline AI edit | 1 | $0.10 | ~$0.007 | ~93% |

**Why RFP answers cost more than a single inline edit.** An RFP answer is not
just text generation — the model has to recall from the knowledge base, pick
the right source, write a grounded answer, and match your default tone.
That work uses cached KB tokens, a longer system prompt, and a self-check
("if no source, flag rather than invent"). Charging the same as an inline
rewrite would under-price the most valuable action in the product. The 2–4
range scales by question length and complexity: short questions = 2, normal =
3, long-form = 4.

**Reruns and context-grounded actions are not free.** Every action that
re-uses cached context still pays for read + analyse + write + tone match —
just less than a cold pass. Concretely:

- **Proposal section regen (4–6):** reads workspace profile + the existing
  draft (for tonal consistency), then writes one section. Heavy sections
  (Scope, Deliverables, Pricing) = 6; medium (Overview, Objectives, Timeline)
  = 5; light (Terms, Next steps) = 4. The whole-proposal price (12–20) is
  *not* simply 8 sections × section regen — the full draft amortises a
  longer system prompt and runs the sections together.
- **RFP re-answer one question:** same 2–4 cost as a fresh answer, because
  the model does the same work — KB recall, source pick, grounded write.
  We deliberately don't discount re-answers; otherwise users would re-roll
  every "high"-confidence response to taste-tune for free.
- **Contract follow-up (3–5):** the contract stays cached after the first
  review, so follow-ups skip the heavy cache-write. Still pays for cache
  read + focused output. Scales by question length.
- **Re-run a contract section (5–8):** a deeper re-analysis of one part
  (e.g. "rewrite all suggested edits in a stricter tone") — heavier output
  than a follow-up.
- **AI knowledge import (2 / entry):** the model has to read a paste, split
  it into logical entries, write titles, and assign tags. 2 credits per
  entry detected — predictable so users can plan a big import.
- **Inline AI edit (1):** rewrite / shorten / lengthen / formal / friendly /
  concise on a selected passage. No knowledge recall, no extra context —
  just the selected text in, the rewrite out.

Manual editing is always free — it spends no tokens, so it costs no credits.
This is also the main "feels generous" lever without any token risk.

## 3. Plans (recurring)

| Plan | Price/mo | Included credits | Token COGS of allowance | Gross margin* |
|---|---|---|---|---|
| Free | $0 | **20 (one-time)** — enough for one proposal *or* one short contract review | ~$0.24 | acquisition cost |
| Starter | $39 | 400 | ~$4.80 | ~88% |
| Growth | $99 | 1,200 | ~$14.40 | ~85% |
| Scale | $249 | 3,500 | ~$42.00 | ~83% |

**Why Free is one task.** 20 credits lets a curious visitor try the strongest
flow — drafting a proposal or running a contract review — once, end-to-end.
It does not let them grind through RFP answers or burn meaningful tokens.
Outputs are watermarked; knowledge base is capped at 3 entries. Anyone who
needs more upgrades to Starter.

**Every plan is single-user.** We do not offer teammate seats, multi-user
workspaces, or enterprise SSO at any price point — those add operational
weight that doesn't fit a credit-priced product. Customers who need
multi-user workflows can run separate workspaces under separate accounts.

**Monthly only.** We do not offer annual plans. Annual commitments
introduce refund and proration complexity around credit allowances that
isn't worth the slight conversion lift — and they remove our optionality
to pivot or sunset the product cleanly.

\*Before Stripe fees and fixed costs; assumes full allowance is consumed
(most users won't use 100%, so realised margin is higher).

Effective subscription rate ≈ **$0.0975/credit** — deliberately *below* pack
pricing so subscriptions are the better deal and recurring revenue is favoured.

## 4. Credit packs (never expire, no subscription required)

| Pack | Price | $/credit |
|---|---|---|
| 100 | $15 | $0.150 |
| 300 | $39 | $0.130 |
| 750 | $89 | $0.119 |
| 2,000 | $199 | $0.0995 |

Per-credit price ($0.10–0.15) stays above the worst-case COGS (~$0.012) by
8–12x and above the subscription rate, so packs are pure upside and never
undercut plans.

## 5. Why this can't burn us

1. **No unlimited anything.** Every token-spending action debits credits first; spend is capped by what the customer has paid for.
2. **Credit price >> token cost** on every single action (8x floor, 20x+ typical).
3. **Block at zero.** AI pauses until top-up; a ledger records every debit/credit.
4. **Caching** (KB + contracts) keeps repeat actions on the same context cheap, widening margin further.
5. **Range shown before, actual after** — but "actual" is measured in our
   margin-loaded credits, not raw tokens, so even a long generation can't go
   underwater.

## 6. Levers to revisit after real usage data

- If a Haiku-class model is good enough for RFP answers, per-question COGS drops ~3–4x → raise margin or lower the credit price to compete.
- Tune the contract length → credit curve once we see real document sizes.
- Watch regeneration rate; if users regen heavily, nudge section-regen credits up.
- Consider an annual plan (2 months free) to improve LTV and cash flow.

## 7. Live Stripe IDs

Products and prices live in the **Exposql Checklist** account
(`acct_1TZu9cDs5O82YiC2`). Live IDs are committed to `lib/stripe.ts`; the
`.env.example` mirrors them so non-prod environments can swap to test mode
without touching the code.

| Product | Product ID | Price ID | Amount |
|---|---|---|---|
| Rufus — Starter Plan | `prod_UbBEk3ZB8WXwei` | `price_1TbysLDs5O82YiC2rqsujnfC` | $39/mo |
| Rufus — Growth Plan | `prod_UbBEX9KipbdkWN` | `price_1TbysMDs5O82YiC2CZ8E0FBs` | $99/mo |
| Rufus — Scale Plan | `prod_UbBETtcdpUHk4n` | `price_1TbysMDs5O82YiC29g1ZgPS3` | $249/mo |
| Rufus — Credit Pack (100) | `prod_UbBEjJn0fFVb1f` | `price_1TbysNDs5O82YiC2NknzSA5H` | $15 |
| Rufus — Credit Pack (300) | `prod_UbBEKGyNyE3kjv` | `price_1TbysNDs5O82YiC24ankJlzm` | $39 |
| Rufus — Credit Pack (750) | `prod_UbBEeXotlGN93h` | `price_1TbysODs5O82YiC2mRXGWLOH` | $89 |
| Rufus — Credit Pack (2,000) | `prod_UbBEn1XveQhld8` | `price_1TbysODs5O82YiC2nbO4luyS` | $199 |
