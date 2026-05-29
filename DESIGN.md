# ExpoSQL design system — for Rufus & beyond

A complete, copy-pasteable reference for the look-and-feel used in
**Rufus** (rufus.exposql.com) so the same design language can be ported to
other ExpoSQL products. Everything you need to recreate the system —
palette, type, motion, components, infographics — is in this file. No
external dependencies on a design-token library.

> If a future project wants the same warm, editorial, continuously-in-motion
> feel, hand them this file alone and they should be able to rebuild it.

**Last updated:** May 28, 2026

---

## Table of contents

1. [Design philosophy](#1-design-philosophy)
2. [Palette](#2-palette)
3. [Typography](#3-typography)
4. [Spacing & layout](#4-spacing--layout)
5. [Borders, radii, shadows](#5-borders-radii-shadows)
6. [Tailwind config (drop-in)](#6-tailwind-config-drop-in)
7. [globals.css (drop-in)](#7-globalscss-drop-in)
8. [Component patterns](#8-component-patterns)
9. [Background system](#9-background-system)
10. [Motion principles](#10-motion-principles)
11. [Keyframes catalogue](#11-keyframes-catalogue)
12. [Infographic primitives](#12-infographic-primitives)
13. [Page patterns](#13-page-patterns)
14. [Iconography & illustrations](#14-iconography--illustrations)
15. [Accessibility & reduced motion](#15-accessibility--reduced-motion)
16. [The "don'ts"](#16-the-donts)
17. [Quick-start checklist for a new app](#17-quick-start-checklist-for-a-new-app)

---

## 1. Design philosophy

Three words capture it: **calm, premium, editorial.**

- **Warm cream surfaces.** Not white. Paper-coloured backgrounds set a
  publishing tone — like a Sunday magazine, not a SaaS console.
- **Quiet ink.** Pure-black is too harsh. We use a dark warm-grey
  (#1B1A16) so type sits *on* the paper instead of slicing through it.
- **One italic accent.** Every heading has exactly one italic-serif word,
  in indigo. That's the signature — the tonal shift that says "this
  product has taste."
- **Continuous, subtle motion.** Big silk-coloured blobs drift behind every
  page. Cards have a slow shimmer sweep. Thumbnails replay their entry
  animations every 5–7 seconds. Numbers count up. The page is never quite
  still, but never urgent.
- **Earned vibrance.** The pastels (lavender, blush, sky, mint, peach) are
  reserved for *accent surfaces* — never UI states like "danger". Use them
  to give a card identity, not to convey meaning.
- **Honest, plain language.** Voice matches the visual calm. No "blockchain-grade."
  No "revolutionary." Just specific, useful sentences. (Voice rules live in
  `PRODUCT.md`; this file covers visuals only.)

---

## 2. Palette

```
PAPER (warm cream — the canvas)
  DEFAULT  #F4F0E8       Page background
  50       #FBF9F4       Brighter cards, modal backdrops
  100      #F7F3EC       Chips, soft surfaces
  200      #EEE8DC       Borders against paper
  300      #E4DCCB       Stronger paper borders, dividers on accent

INK (warm dark — the type)
  DEFAULT  #1B1A16       Headings, body text
  900      #1B1A16       same
  700      #3A382F       Subtitle text, button hover
  500      #6B675B       Secondary copy, body labels
  400      #8C8779       Tertiary copy, captions, faded icons

SILK (the pastel accent family — reserved for surfaces)
  lav      #C7B8F5       Lavender
  peri     #A9B8FF       Periwinkle
  sky      #9FD0FF       Sky blue
  mint     #B7ECD6       Mint
  blush    #FFC4D6       Blush pink
  peach    #FFD3AE       Peach

ACCENT (the only saturated brand colour)
  DEFAULT  #5b5bd6       Indigo accent — italic words, link emphasis,
  600      #4f46e5       hover pill in admin panel, etc.
```

### Usage rules

- **Body type = ink-900. Subtle copy = ink-500. Hints/captions = ink-400.** Don't go darker than ink-700 for hover states.
- **Surfaces graduate paper → paper-50 → white.** A page on `paper`, cards on `paper-50` or `white`, modals on `white`.
- **Silk colours go on rounded badges, icon bubbles, and gradients only.** Never as a text colour or button background. Use them at **/40 opacity** when they sit behind icons (e.g. `bg-silk-lav/40`).
- **Accent indigo is for emphasis, not surfaces.** Italic words in headings, the "Most popular" chip border, the focus ring on inputs.
- **Status colours are *minimally* pastel:** rose for errors, amber for warnings, emerald for success. We borrow Tailwind's defaults at /10 opacity for the badge background and use /20 for borders. Don't reach for silk pinks/peaches to signal danger — they're aesthetic, not semantic.

### Selection colour

The text-selection highlight is **silk-lav** (`#C7B8F5`) so even the OS-drawn highlight feels on-brand:

```css
::selection { background: #C7B8F5; color: #1B1A16; }
```

---

## 3. Typography

Two font families, both via Google Fonts:

| Family | Role | Loaded as |
|---|---|---|
| **Plus Jakarta Sans** | UI sans-serif — all body type, headings, buttons. Weights 400–800. | `next/font/google` → `--font-sans` |
| **Instrument Serif** | Italic accent — exactly one word per heading. Weight 400 italic. | `next/font/google` → `--font-serif` |

### Heading conventions

- **Class string:** `font-semibold tracking-[-0.02em] leading-[1.12]`
- **Sizes (responsive):** `text-3xl sm:text-4xl md:text-[2.9rem]` for h2;
  `text-4xl sm:text-5xl md:text-[3.6rem]` for the home h1.
- **Always lower-case headings sentence-style.** Capitalise proper nouns only.

### The italic accent

This is the signature move. Every heading has one italic-serif word in indigo:

```tsx
<h1 className="text-4xl font-semibold leading-[1.06] tracking-[-0.02em]">
  Win the work, then <span className="accent-italic text-accent">close it</span> — your document AI.
</h1>
```

The class `.accent-italic` is defined in globals.css:

```css
.accent-italic { @apply font-serif font-normal italic; }
```

Rules:
- **Exactly one** italic phrase per heading. Two looks restless.
- Pick the most emotionally charged 1–3 words ("close it", "win and close", "without notice", "never expire", "for your review").
- Don't italicise generic transitions ("the", "and", "of").
- Body text never uses the italic accent — it's reserved for headings and the occasional callout.

### Body type

```
Body            text-[15px] leading-relaxed text-ink-700  (~15px, 1.625)
Small caption   text-xs text-ink-400                       (~12px)
Eyebrow label   text-[13px] font-medium tracking-wide      (see Eyebrow component)
```

### Code/mono

Use `font-mono text-xs leading-relaxed` for any code-like content. We don't
load a custom monospace — system defaults are fine.

---

## 4. Spacing & layout

### Container

```tsx
<div className="container-x">  // mx-auto w-full max-w-6xl px-5 sm:px-8
```

Max width 72rem (1152px). Mobile horizontal padding 20px, ≥sm 32px. This is
*the* page container. Use it everywhere except hosted public pages and
fullscreen experiences.

### Section spacing

Standard section: `py-24 sm:py-32` (96px / 128px vertical).
Page hero top-padding: `pt-36 sm:pt-44` (to clear the fixed Navbar).

### Grid breakpoints

Mobile-first as standard Tailwind. The two breakpoints we use most:

- `sm:` (640px) — tablet, where two-column layouts engage.
- `lg:` (1024px) — desktop, where four-column grids engage and the app sidebar shows.

We avoid `md:` and `xl:` mostly — keep the responsive surface simple.

### Vertical rhythm

- Section header to first content: `mt-12` (48px).
- Between cards in a grid: `gap-5` (20px).
- Between stacked panels: `space-y-4` (16px) or `space-y-5`.

---

## 5. Borders, radii, shadows

### Radii

| Use | Class | Pixels |
|---|---|---|
| Pills (buttons, chips) | `rounded-full` | — |
| Inputs, small surfaces | `rounded-xl` | 12px |
| Standard surface cards | `rounded-2xl` | 16px |
| Hero cards & dialogs | `rounded-[26px]` (the `.card` default) | 26px |
| Page-level rounded square (e.g. icon bg, modal containers) | `rounded-[36px]` | 36px |

### Borders

We don't use solid black borders. Borders are **ink-900 at low opacity**:

```
border border-ink-900/[0.06]    Default soft border (cards on paper)
border border-ink-900/[0.07]    The .card default
border border-ink-900/[0.1]     Input borders
border border-ink-900/[0.12]    Slightly stronger (button outlines, soft buttons)
```

Borders below 0.05 disappear on cream backgrounds — don't go lighter.

### Shadows

Three shadows total — defined in `tailwind.config.ts`:

```js
shadow: {
  soft: '0 1px 2px rgba(27,26,22,0.04), 0 10px 30px -12px rgba(27,26,22,0.12)',
  lift: '0 1px 2px rgba(27,26,22,0.05), 0 24px 60px -20px rgba(27,26,22,0.22)',
  pill: '0 1px 2px rgba(27,26,22,0.18), 0 8px 20px -6px rgba(27,26,22,0.28)',
}
```

- `shadow-soft` — default on cards. Quiet.
- `shadow-lift` — used on featured cards or hover state. Lifts off the page.
- `shadow-pill` — for primary buttons. Strong contact with the surface.

Shadows are **warm** because the colour is ink (#1B1A16) not pure black,
matching the paper background.

---

## 6. Tailwind config (drop-in)

Save as `tailwind.config.ts`. The entire palette, custom keyframes, and
animations live here.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4F0E8",
          50: "#FBF9F4", 100: "#F7F3EC", 200: "#EEE8DC", 300: "#E4DCCB",
        },
        ink: {
          DEFAULT: "#1B1A16",
          900: "#1B1A16", 700: "#3A382F", 500: "#6B675B", 400: "#8C8779",
        },
        silk: {
          lav: "#C7B8F5", peri: "#A9B8FF", sky: "#9FD0FF",
          mint: "#B7ECD6", blush: "#FFC4D6", peach: "#FFD3AE",
        },
        accent: { DEFAULT: "#5b5bd6", 600: "#4f46e5" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,26,22,0.04), 0 10px 30px -12px rgba(27,26,22,0.12)",
        lift: "0 1px 2px rgba(27,26,22,0.05), 0 24px 60px -20px rgba(27,26,22,0.22)",
        pill: "0 1px 2px rgba(27,26,22,0.18), 0 8px 20px -6px rgba(27,26,22,0.28)",
      },
      keyframes: {
        "silk-1": {
          "0%,100%": { transform: "translate3d(-8%,-4%,0) rotate(0deg) scale(1.05)" },
          "50%":     { transform: "translate3d(10%,6%,0) rotate(40deg) scale(1.25)" },
        },
        "silk-2": {
          "0%,100%": { transform: "translate3d(8%,4%,0) rotate(0deg) scale(1.1)" },
          "50%":     { transform: "translate3d(-10%,-6%,0) rotate(-50deg) scale(1.3)" },
        },
        "silk-3": {
          "0%,100%": { transform: "translate3d(0,8%,0) rotate(0deg) scale(1.1)" },
          "50%":     { transform: "translate3d(-6%,-8%,0) rotate(30deg) scale(1.2)" },
        },
        float:        { "0%,100%": { transform: "translateY(0)" },    "50%": { transform: "translateY(-10px)" } },
        marquee:      { "0%": { transform: "translateX(0)" },         "100%": { transform: "translateX(-50%)" } },
        "marquee-rev":{ "0%": { transform: "translateX(-50%)" },      "100%": { transform: "translateX(0)" } },
        "spin-slow":  { "0%": { transform: "rotate(0deg)" },          "100%": { transform: "rotate(360deg)" } },
        shimmer:      { "0%": { transform: "translateX(-120%)" },     "100%": { transform: "translateX(220%)" } },
        eq:           { "0%,100%": { transform: "scaleY(0.3)" },      "50%": { transform: "scaleY(1)" } },
        "pulse-ring": { "0%": { transform: "scale(0.8)", opacity: "0.6" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
      },
      animation: {
        "silk-1": "silk-1 22s ease-in-out infinite",
        "silk-2": "silk-2 26s ease-in-out infinite",
        "silk-3": "silk-3 30s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        "marquee-rev": "marquee-rev 46s linear infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        shimmer: "shimmer 3.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## 7. globals.css (drop-in)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans:  "Plus Jakarta Sans", system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
}

* {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
html { scroll-behavior: smooth; }
body { background-color: #f4f0e8; color: #1b1a16; overflow-x: hidden; }
::selection { background: #c7b8f5; color: #1b1a16; }

@layer components {
  .container-x       { @apply mx-auto w-full max-w-6xl px-5 sm:px-8; }
  .accent-italic     { @apply font-serif font-normal italic; }
  .eyebrow           { @apply inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-ink-500; }
  .eyebrow::before   { content: ""; @apply inline-block h-1.5 w-1.5 rounded-full bg-ink-900/70; }
  .btn-dark          { @apply inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-semibold text-paper-50 shadow-pill transition-all duration-300 hover:bg-ink-700 hover:-translate-y-0.5 active:translate-y-0; }
  .btn-soft          { @apply inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/[0.12] bg-paper-50/70 px-6 py-3.5 text-sm font-semibold text-ink-900 backdrop-blur transition-all duration-300 hover:border-ink-900/25 hover:bg-paper-50; }
  .card              { @apply rounded-[26px] border border-ink-900/[0.07] bg-white shadow-soft; }
  .chip              { @apply inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-paper-100 px-3 py-1 text-xs font-medium text-ink-700; }
  .input             { @apply w-full rounded-xl border border-ink-900/[0.1] bg-paper-50/70 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow placeholder:text-ink-400 focus:border-accent/40 focus:ring-2 focus:ring-accent/15; }
}

.silk-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.85;
}

.marquee-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

.shimmer-sweep {
  position: absolute; inset: 0;
  overflow: hidden; border-radius: inherit;
  pointer-events: none;
}
.shimmer-sweep::after {
  content: ""; position: absolute; top: 0; left: 0;
  height: 100%; width: 35%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent);
  transform: translateX(-120%);
  animation: shimmer 3.5s ease-in-out infinite;
}

.grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 8. Component patterns

### Buttons

Two variants — primary dark + soft secondary. Both pill-shaped.

```tsx
{/* Primary */}
<button className="btn-dark">
  Get started <ArrowUpRight className="h-4 w-4" />
</button>

{/* Secondary */}
<button className="btn-soft">
  Learn more
</button>
```

Buttons **lift on hover** (`hover:-translate-y-0.5`). They have an inset
shadow (`shadow-pill`) that grounds them. Don't make them rectangular —
the pill shape is part of the brand.

### Cards

```tsx
<div className="card relative overflow-hidden p-6">
  <span className="shimmer-sweep" />   {/* optional shimmer */}
  <h3 className="text-xl font-semibold tracking-[-0.01em]">Card title</h3>
  <p className="mt-2 text-sm text-ink-500">Body copy.</p>
</div>
```

The shimmer sweep is the secret sauce — it loops a soft white diagonal
gradient across the card every 3.5s. Add it whenever you want a card to feel
"alive". Skip on data-dense cards where it would distract.

For hover-lift:

```tsx
<div className="card transition-shadow duration-300 hover:shadow-lift hover:-translate-y-1">
```

### Inputs

```tsx
<input className="input" placeholder="hello@..." />
<textarea className="input resize-none" rows={4} />
```

The focus state uses `ring-2 ring-accent/15` — a faint indigo halo. Don't
go heavier than that; it competes with the rest of the page.

### Chips

```tsx
<span className="chip">Free</span>
<span className="chip text-[10px] border-accent/20 bg-accent/[0.06] text-accent">Most popular</span>
```

Chips are for *labels*, not states. For status badges use the chip class plus
status-coloured override (emerald/amber/rose at /10 opacity).

### Eyebrow labels

The little dot-prefixed kicker over a heading:

```tsx
<p className="eyebrow">Three tools, one workspace</p>
<h2 className="mt-4 text-3xl font-semibold ...">The documents that <span className="accent-italic text-accent">win and close</span> business.</h2>
```

The `::before` pseudo-element draws the dot — no extra markup needed.

### Container & section

```tsx
<section className="py-24 sm:py-32">
  <div className="container-x">
    {/* …content… */}
  </div>
</section>
```

---

## 9. Background system

Two parts: a fixed **SilkBackground** behind every page, and an optional
**SilkRibbon** for CTA bands.

### SilkBackground (always-on)

Mount once in the root layout. It sits at `-z-10` and never moves with the
scroll. The three silk blobs drift slowly across the viewport, gradient
veiling fades the bottom to solid paper, and a faint SVG noise overlay adds
a paper-grain texture.

```tsx
export function SilkBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-paper" />
      <div className="silk-blob animate-silk-1 left-[-10%] top-[-5%] h-[42vw] w-[42vw] bg-silk-lav/45" />
      <div className="silk-blob animate-silk-2 right-[-8%] top-[20%] h-[38vw] w-[38vw] bg-silk-sky/40" />
      <div className="silk-blob animate-silk-3 bottom-[-10%] left-[25%] h-[40vw] w-[40vw] bg-silk-peach/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/40 to-paper" />
      <div className="grain absolute inset-0 opacity-[0.04] mix-blend-multiply" />
    </div>
  );
}
```

### SilkRibbon (a flowing band for CTA backgrounds)

Use as the background of a "hero" or final-CTA card. Five blobs side-by-side
animate in different rhythms, with a horizontal white strip across the
middle for legibility.

```tsx
<div className="relative overflow-hidden rounded-[36px] border bg-ink-900 p-16 text-center">
  <SilkRibbon className="absolute inset-0 opacity-60" />
  <div className="relative">
    <h2 className="text-paper-50 text-4xl">{title}</h2>
    {/* … */}
  </div>
</div>
```

The full ribbon component is in `components/Silk.tsx` in Rufus.

### Choosing the silk mix

Each silk colour carries an unspoken meaning we've found useful — not
strict, but worth knowing:

| Silk | Feels like |
|---|---|
| lavender (`#C7B8F5`) | Calm, creative, lead colour |
| periwinkle (`#A9B8FF`) | Trustworthy, neutral |
| sky (`#9FD0FF`) | Open, clean |
| mint (`#B7ECD6`) | Fresh, optimistic |
| blush (`#FFC4D6`) | Warm, attention |
| peach (`#FFD3AE`) | Energetic, draft warmth |

Pick 2–3 per page for the SilkBackground and use the others sparingly in
icon bubbles. Don't put all six on screen at once — it looks like a candy
shop.

---

## 10. Motion principles

Framer Motion v11+ is the only animation engine we use beyond Tailwind's
`@keyframes`. Some non-negotiable rules:

### Standard ease

```ts
const ease = [0.22, 1, 0.36, 1] as const;
```

Use this on **every** Framer Motion transition. It's an aggressive ease-out
that lands gently — fits the "calm but responsive" feel.

### Duration scale

```
Snap (small UI toggles, chip selection):  0.30 – 0.35s
Standard (card reveal, modal):            0.4 – 0.5s
Slow (page reveal, big shifts):           0.6 – 0.9s
Ambient loops:                            3 – 30s
```

Anything faster than 0.3s feels jittery; anything slower than 1s for a
discrete action feels broken.

### Scroll reveals

The standard scroll-reveal pattern lives in `components/Reveal.tsx`. Wrap
any section that should fade-up on entry:

```tsx
"use client";
import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

Use with `delay = i * 0.08` (or 0.1) when revealing a row of cards in
sequence.

### Replay-on-hover thumbnails

Small mock previews on the home page replay their entry animation every
~6 seconds, **and immediately when the user hovers**. The pattern:

```tsx
function useReplay(every: number) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), every);
    return () => clearInterval(id);
  }, [every]);
  return { cycle, advance: () => setCycle((c) => c + 1) };
}

// Inside the component:
const { cycle, advance } = useReplay(6200);
return (
  <div onMouseEnter={advance} key={cycle}>
    {/* children with initial/animate framer props */}
  </div>
);
```

The `key={cycle}` is the trick — bumping the key remounts the children,
which retriggers their `initial → animate` transition.

### Layout-id tab pill

When a tab pill animates between two buttons, use Framer's `layoutId`:

```tsx
{tabs.map((t) => {
  const active = current === t.key;
  return (
    <button key={t.key} onClick={() => setCurrent(t.key)} className="relative rounded-full px-3 py-1.5 text-xs font-semibold">
      {active && (
        <motion.span
          layoutId="my-tab-pill"
          className="absolute inset-0 rounded-full bg-ink-900"
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
        />
      )}
      <span className="relative">{t.label}</span>
    </button>
  );
})}
```

The pill **physically slides** between buttons. Used on Pricing toggle,
showcase tabs, contract review tabs.

### Shimmer sweep (background motion)

Already covered in CSS: add `<span className="shimmer-sweep" />` as the first
child of any element with `position: relative`. The CSS does the rest. Use
on hero cards, pricing cards, anything that should feel "premium-active".

### Pulse ring (call-attention)

A growing ring around a focal element — typically used on icons:

```tsx
<span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-silk-lav/40">
  <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-silk-lav/40" />
  <Icon className="relative h-5 w-5" />
</span>
```

Use sparingly — only when you really want eyes on something.

### Count-up numbers

When you display a stat, **animate it counting from 0 to the value** when
it enters the viewport:

```tsx
"use client";
import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ to, prefix = "", suffix = "", duration = 1.4 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, duration]);

  return <span ref={ref}>{prefix}{Math.round(val)}{suffix}</span>;
}
```

Used on home-page stats: `<CountUp to={120} suffix="+" />` etc.

### Reduced motion

The global CSS rule at the bottom of globals.css disables all animations
when the user's OS reports `prefers-reduced-motion: reduce`. Don't override
this. Test it (DevTools → Rendering → Emulate prefers-reduced-motion).

---

## 11. Keyframes catalogue

These nine keyframes (defined in `tailwind.config.ts`) plus a handful of
named animations cover everything in the system.

| Keyframe | Duration | Used for |
|---|---|---|
| `silk-1` | 22s ease-in-out infinite | First silk blob in the background |
| `silk-2` | 26s ease-in-out infinite | Second silk blob |
| `silk-3` | 30s ease-in-out infinite | Third silk blob |
| `float` | 6s ease-in-out infinite | Subtle up-and-down for floating accents (sparkles in the top-right of cards, etc.) |
| `marquee` | 38s linear infinite | Right-to-left scroll for task strips |
| `marquee-rev` | 46s linear infinite | Left-to-right scroll for the second row |
| `marquee-slow` | 60s linear infinite | Optional slower variant |
| `spin-slow` | 26s linear infinite | Decorative spinning elements |
| `shimmer` | 3.5s ease-in-out infinite | The diagonal sweep across cards |
| `eq` | (custom delays) | The "AI working" waveform bars |
| `pulse-ring` | 2.4s ease-out infinite | Attention-grabbing ring around icons |

The `silk-N` keyframes rotate the blob and scale it 1.05 → 1.25-1.3 → 1.05.
Combined with the long, asynchronous durations (22/26/30s) you get a
hypnotic drift that never feels repetitive because the three never line up.

---

## 12. Infographic primitives

The non-text visual elements that carry meaning across the product.

### Waveform — "AI is working"

Twelve vertical bars with staggered `animate-eq` durations and delays.
Gradient from periwinkle to blush. Use anywhere an AI call is in flight.

```tsx
const bars = [0.4, 0.8, 0.55, 1, 0.7, 0.35, 0.9, 0.5, 0.75, 0.45, 0.85, 0.6];

export function Waveform({ label = "Drafting…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border bg-white/90 px-4 py-2.5 shadow-soft backdrop-blur">
      <div className="flex h-5 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] origin-center rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq"
            style={{
              height: `${h * 100}%`,
              animationDuration: `${0.9 + (i % 4) * 0.18}s`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-700">{label}</span>
    </div>
  );
}
```

### TaskMarquee — infinite scrolling chip strip

Used on the home page to show "everything Rufus takes off your plate."
Two rows scrolling in opposite directions, with edge fading via
`.marquee-mask`.

```tsx
const tasks = ["Draft proposals", "Build pricing tables", "Answer RFPs", /* … */];

export function TaskMarquee() {
  const items = [...tasks, ...tasks];
  return (
    <div className="marquee-mask relative flex flex-col gap-3 overflow-hidden py-2">
      <div className="flex w-max animate-marquee items-center gap-3">
        {items.map((t, i) => <Chip key={`a-${i}`} t={t} dot="bg-silk-peri" />)}
      </div>
      <div className="flex w-max animate-marquee-rev items-center gap-3">
        {items.map((t, i) => <Chip key={`b-${i}`} t={t} dot="bg-silk-blush" />)}
      </div>
    </div>
  );
}
```

Duplicate the array so the loop is seamless. Each chip is a `<span className="chip">` with a tinted dot prefix.

### Floating sparkle accent

A tiny Lucide `Sparkles` icon in the top-right of a card, animated with
`animate-float`. Add `group-hover:text-accent/70` for a hover tint.

```tsx
<div className="card group relative">
  <span aria-hidden className="absolute right-5 top-5 animate-float text-ink-400/40 group-hover:text-accent/70">
    <Sparkles className="h-3.5 w-3.5" />
  </span>
  {/* … */}
</div>
```

### Animated total / shimmer-on-update

When a number changes (e.g. a pricing total), give it a quick opacity blip
to draw the eye:

```tsx
<motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-semibold">
  {fmt(total)}
</motion.span>
```

The `key={total}` makes Framer remount on every change, retriggering the
flash.

### Dot bullet (informal list)

Use a small coloured dot instead of a bullet point:

```tsx
<li className="flex items-start gap-2.5">
  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900/40" />
  Item text
</li>
```

For accent-coloured dots, swap the bg class for `bg-silk-peri` etc.

---

## 13. Page patterns

The macro shapes most marketing/app screens use.

### Hero with italic accent

```tsx
<section className="px-5 pb-12 pt-36 sm:px-8 sm:pt-44">
  <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
    <Reveal>
      <p className="eyebrow">Product name — short tagline</p>
      <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-[-0.02em] sm:text-5xl md:text-[3.6rem]">
        Headline with <span className="accent-italic text-accent">italic accent</span> — finished thought.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
        Subhead — one or two sentences. Plain.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/app" className="btn-dark">Primary CTA <ArrowUpRight className="h-4 w-4" /></Link>
        <Link href="/learn" className="btn-soft">Secondary CTA</Link>
      </div>
    </Reveal>
    <Reveal delay={0.15}>
      <Showcase />  {/* or a hero image / mock */}
    </Reveal>
  </div>
</section>
```

### Section header

```tsx
<Reveal>
  <p className="eyebrow">Three tools, one workspace</p>
  <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
    The documents that <span className="accent-italic text-accent">win and close</span> business.
  </h2>
</Reveal>
```

### Three-card grid with replaying thumbnails

```tsx
<div className="mt-12 grid gap-5 md:grid-cols-3">
  {items.map((t, i) => (
    <Reveal key={t.key} delay={i * 0.1}>
      <Link href={t.href} className="card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
        <span className="shimmer-sweep" />
        <span aria-hidden className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full ${t.accent}/35 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`} />
        <div className="relative flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-2xl ${t.accent}/40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <t.Icon className="h-5 w-5 text-ink-900" />
          </span>
          <span className="text-xs font-medium text-ink-400">{t.audience}</span>
        </div>
        <h3 className="relative mt-5 text-xl font-semibold tracking-[-0.01em]">{t.name}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{t.blurb}</p>
        <div className="relative mt-6 rounded-2xl border border-ink-900/[0.05] bg-paper-50/60 p-4">
          <t.Thumbnail />
        </div>
        <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
          Explore <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </Reveal>
  ))}
</div>
```

Card hover effects combine: lift, soft pastel glow behind the icon, icon
scale + rotate, arrow translate. All four happen together, all driven by
`group-hover:`.

### FAQ accordion

Centered eyebrow + heading, then a card-less accordion of `+`/`×`
prefixed items. Each item expands on click with `motion.div height: auto`.

```tsx
<Reveal>
  <div className="flex justify-center"><p className="eyebrow">Questions</p></div>
  <h2 className="mt-4 text-center text-3xl font-semibold leading-[1.12] tracking-[-0.02em]">
    Good to <span className="accent-italic text-accent">know</span>.
  </h2>
</Reveal>
<Faq items={faqItems} />
```

The Faq component handles its own state per item.

### CTA band (dark, with SilkRibbon)

The final block on any page:

```tsx
<section className="py-24 sm:py-32">
  <div className="container-x">
    <Reveal>
      <div className="relative overflow-hidden rounded-[36px] border border-ink-900/[0.08] bg-ink-900 px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20">
        <SilkRibbon className="absolute inset-0 opacity-60" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-paper-50 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-paper-200/80">{sub}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryHref} className="btn-soft">{primaryLabel}</Link>
            <Link href={secondaryHref} className="text-paper-200/90 hover:text-paper-50 text-sm font-semibold">{secondaryLabel}</Link>
          </div>
        </div>
      </div>
    </Reveal>
  </div>
</section>
```

Note: on dark backgrounds, the primary button **inverts** to `btn-soft`
(which uses a translucent paper colour). Dark on dark would disappear.

### Pricing card

```tsx
<div className={`card relative flex h-full flex-col overflow-hidden p-7 ${featured ? "shadow-lift ring-1 ring-accent/30" : ""}`}>
  {featured && <span className="shimmer-sweep" />}
  <div className="relative flex h-full flex-col">
    {featured && <span className="chip mb-4 w-fit border-accent/20 bg-accent/10 text-accent">Most popular</span>}
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="mt-1 text-sm text-ink-400">{tagline}</p>
    <div className="mt-5 flex items-baseline gap-1">
      <span className="text-4xl font-semibold tracking-[-0.02em]">${price}</span>
      <span className="text-sm text-ink-400">/mo</span>
    </div>
    <p className="mt-1 text-xs text-ink-400">{note}</p>
    <button className={`mt-5 w-full ${featured ? "btn-dark" : "btn-soft"}`}>{cta}</button>
    <ul className="mt-6 space-y-3">{/* features */}</ul>
  </div>
</div>
```

The **featured** card distinguishes itself by:
- Indigo accent ring (`ring-1 ring-accent/30`)
- Bigger shadow (`shadow-lift`)
- Active shimmer sweep
- "Most popular" indigo chip
- Primary dark button

---

## 14. Iconography & illustrations

### Icons

**Lucide React** only. Period. Standard sizes:

```
h-3.5 w-3.5      Chip/inline (14px)
h-4 w-4          Default UI (16px)
h-5 w-5          Section icons (20px)
h-6 w-6          Empty-state, page-level (24px)
```

Icon colours typically use `text-ink-900` (full strength) or `text-ink-400`
(faded). Use `text-accent` sparingly for emphasis (sparkle on a CTA, etc.).

### Logo / mark

The standard wordmark is a small gradient icon + "Rufus" + "by ExpoSQL"
subtitle:

```tsx
<Link href="/" className="flex items-center gap-2.5">
  <span className="relative grid h-8 w-8 place-items-center">
    <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
      <defs>
        <linearGradient id="rfx" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#A9B8FF" />
          <stop offset="0.5" stopColor="#C7B8F5" />
          <stop offset="1" stopColor="#FFC4D6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="12" fill="url(#rfx)" />
      <path
        d="M14 28V13h7a5 5 0 0 1 0 10h-7m7 0 5 5"
        stroke="#1B1A16" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  </span>
  <span className="text-[15px] font-semibold leading-none tracking-tight">
    Rufus<span className="ml-1 font-medium text-ink-400">by ExpoSQL</span>
  </span>
</Link>
```

For app icon / favicon, scale the same gradient + letterform to a
1024×1024 SVG with rounded corners (`rx=224`). The letterform stroke widens
proportionally (~88 in a 1024 canvas).

### Brand gradients

Two standard gradients you can pluck from the SVG defs:

```css
/* The mark gradient — diagonal, three stops */
linear-gradient(135deg, #A9B8FF 0%, #C7B8F5 50%, #FFC4D6 100%)

/* Vertical fade — used in waveform bars */
linear-gradient(to bottom, #A9B8FF, #FFC4D6)
```

---

## 15. Accessibility & reduced motion

- **Reduced motion is honoured globally** via the media query at the bottom of `globals.css`. Don't override it.
- **All animations are decorative.** Critical state changes (modal open, error appear) use `AnimatePresence` with short durations (300–400ms) but no parallax or sliding from off-screen — content arrives in place.
- **Focus rings** are an indigo `ring-2 ring-accent/15` halo on inputs and `outline-offset: 2px` on buttons. Don't remove them with `outline-none` unless you're replacing them.
- **Text contrast:** ink-900 on paper passes WCAG AA. Avoid `text-ink-400` on `bg-paper-50` for any text the user needs to read (it passes only barely); keep it for tertiary captions.
- **Colour is never the only signal.** Status badges (success/warning/error) always include an icon or a textual label, never just a coloured dot.

---

## 16. The "don'ts"

A short list that will keep new code consistent with what's been built.

1. **Don't introduce CSS-in-JS or styled-components.** Tailwind classes only. Components compose by accepting `className`.
2. **Don't pull in a design-system library** (shadcn/ui, Radix Primitives, MUI, Mantine). The Rufus design language sits between systems — adopting one will eat the brand. Reach for them only for one-off primitives where the lift is worth it (e.g. `Radix Dialog` if you outgrow the inline modal pattern).
3. **Don't add new colours outside the palette.** If you need a status colour we don't have, propose a swap-in (e.g. amber for warnings is already implied), don't invent a new green.
4. **Don't break the italic-accent rule.** One italic-serif word per heading. Not zero, not two, not the whole heading.
5. **Don't use icons from another set.** Lucide only.
6. **Don't use Tailwind colour scales for ink/paper.** We have our own `ink-900/700/500/400` and `paper-50/100/200/300`. Using `text-slate-700` or `bg-stone-50` breaks the warm-grey effect.
7. **Don't animate without an ease.** The standard `[0.22, 1, 0.36, 1]` ease is mandatory on every Framer Motion transition. Linear easing looks robotic; default ease looks generic.
8. **Don't make animations longer than 1s for discrete actions.** Anything past that feels broken.
9. **Don't put six silk colours on one screen.** Pick two or three.
10. **Don't drop the SilkBackground.** Even on dense app pages it's the connective tissue. (For hosted public pages — like a public proposal — we *do* drop it to keep the recipient's view clean. That's the only exception.)
11. **Don't forget reduced motion.** Test with `prefers-reduced-motion: reduce` engaged — the global rule should kill everything, but custom JS animations need to honour it too.
12. **Don't write em-dash-free copy.** Rufus uses em dashes as a deliberate part of the voice. Other ExpoSQL products can decide differently — but if you're matching Rufus, use them.

---

## 17. Quick-start checklist for a new app

When porting the system to a new product:

1. **Install deps:**
   ```bash
   npm install next react react-dom framer-motion lucide-react tailwindcss postcss autoprefixer
   ```
2. **Copy the Tailwind config** from §6.
3. **Copy globals.css** from §7 into `app/globals.css`.
4. **Load fonts** via `next/font/google`:
   ```tsx
   const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
   const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal","italic"], variable: "--font-serif", display: "swap" });
   ```
   Apply to `<html className={`${jakarta.variable} ${instrument.variable}`}>`.
5. **Mount `SilkBackground`** at the root layout (`<body>`) — see §9.
6. **Create the standard primitives** by copying these files from Rufus:
   - `components/Silk.tsx` (SilkBackground, SilkRibbon)
   - `components/Reveal.tsx`
   - `components/CountUp.tsx`
   - `components/Waveform.tsx`
   - `components/Marquee.tsx`
   - `components/Faq.tsx`
   - `components/CTA.tsx`
   - `components/Logo.tsx` (rename the wordmark to your product)
   - `components/Navbar.tsx`, `components/Footer.tsx` (route-aware)
7. **Build the page-shell pattern:** `app/layout.tsx` with fonts + SilkBackground, `app/(marketing)/layout.tsx` with Navbar + Footer.
8. **Apply the italic-accent rule** to your first heading. If it feels right, you're on-system.
9. **Sanity-check motion:** scroll through a page — silk blobs should drift slowly behind, cards should shimmer-sweep, headings should fade-up on entry. If it's still, something's wrong.
10. **Test reduced motion** in DevTools before shipping.

That's the system. Stick to it and the next ExpoSQL product will feel like
a sibling of Rufus, not a cousin.

— ExpoSQL AI Labs
