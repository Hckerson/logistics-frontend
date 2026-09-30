---
name: elegant-ui
description: >-
    The house mechanics for any React/Next UI in this starter — the design
    tokens in styles/tokens.css (@theme) and public/fonts/font.ts, the named
    scale classes, the primitive standard, decomposed structure, data-driven
    rendering, Carbon icons and a11y by default. Use when building or upgrading
    ANY frontend component, screen or section. It fixes how UI is written, not
    what it should look like: the visual register (dense app, editorial,
    cinematic) comes from the brief or a register skill. Frontend only.
---

# Elegant UI

Every piece of UI in this starter is written in **its own design tokens and primitives**, never generic shadcn defaults. This skill is register-neutral: it governs vocabulary, structure and quality floors. How dense, how loud and how animated the result is belongs to the brief.

## Two modes

| Mode        | Trigger                                                                                              | Output                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Create**  | Component/screen does **not** exist yet ("build a…", "add a…", "make a…")                            | A component written directly into `components/` in the house vocabulary. |
| **Upgrade** | An existing component named + the word **"upgrade"** (or "elevate", "make it premium", "package it") | The component rebuilt against every rule below.                          |

If the mode is ambiguous, default to **Create** and say so.

## Prime directive: translate, don't transplant

Learn _structure, layout, composition, and interaction_ from any exemplar (a dribbble shot, a 21st.dev prompt, a pasted component). But **every color, font, radius, shadow, spacing, and easing value must be a house token** from the table below. A dark hardcoded `bg-black text-neutral-50` reference becomes `bg-sidebar text-sidebar-text-active`. `bg-card` becomes `bg-background-muted`. Never emit a raw hex, a stock Tailwind palette color (`neutral-800`, `slate-500`), or a shadcn default token (`bg-card`, `text-muted-foreground`, `text-foreground`) — those tokens do not exist here. A value the brief needs that has no token gets a token in `styles/tokens.css` first.

## House tokens — the only vocabulary

Tailwind v4, tokens defined in `styles/tokens.css` + `@theme` in `styles/globals.css`. Dark mode = `.dark` class variant (`@custom-variant dark`).

**Color** (prefix `bg-` / `text-` / `border-`):
`background` · `background-alt` · `background-muted` — surfaces
`text` · `text-secondary` · `text-muted` · `text-inverse` — foreground ramp
`primary` · `primary-dark` · `primary-light` and `accent` · `accent-dark` · `accent-light` — brand / interactive color (CTAs, active, emphasis). The concrete hues are defined once in styles/tokens.css.
`highlight` · `highlight-dark` · `highlight-light` — the secondary accent for "pop" moments.
`border` · `border-light` · `border-dark` — 1px dividers
`success` · `error` · `warning` · `info` (+ each `-light`) — status only (note: it is **`error`**, not `danger`)
`sidebar` · `sidebar-border` · `sidebar-hover` · `sidebar-active` · `sidebar-text` · `sidebar-text-active` — the dark ramp
`metric-pipeline` · `metric-success` · `metric-activity` · `metric-warning` — metric/stat accents
`overlay` — modal scrims

**There is no numeric ramp here.** Color steps by named suffix (`accent` / `accent-dark` / `accent-light`), never by `-50…-900`.

**Type:** families `font-display` · `font-body` · `font-mono` — the concrete typefaces are wired once in public/fonts/font.ts and exposed via the @theme in styles/globals.css; never restate the family names here. Scale `text-h1` … `text-h6`, `text-lg` · `text-base` · `text-sm` · `text-xs` · `text-label` · `text-caption` · `text-micro`. Weights `font-light` (300) … `font-bold` (700).

**Named scale classes** in `styles/globals.css`: `.pad` / `.pad-x` / `.pad-y`, `.gap` / `.gap-x` / `.gap-y`, `.large-pad`, `.md-pad`, `.smooth`, `.micro-label` (mono uppercase eyebrow, no colour — append the tone), `.measure` (54ch prose), `.safe-t` / `.safe-b`, `.collapse-grid` (`0fr`↔`1fr` disclosure, flipped by `data-open`), `.dot-grid`, `.focal-glow`, `.nav-floating`, `.context-rail`, and the `.stat-card` / `.metric-*` family. Style with Tailwind utilities on house tokens in the JSX, responsive prefixes included; reach for a named class when a pattern repeats, not by default. A value with no token gets one in `styles/tokens.css` first and is used as `text-(--token)` or through a named class.

**Radius** `rounded-none xs sm md lg xl full`. **Shadow** `shadow-sm md lg xl 2xl`. **Motion** easing `ease-smooth` (default), `ease-out`, `ease-in`, `ease-in-out`, `ease-linear`. **Z-index** via tokens as arbitrary values (`z-(--z-indices-modal)`, `z-(--z-indices-popover)`, …) — there is no `z-modal` utility.

## Structure rules

1. **Decompose aggressively.** One job per component, **one component per file** — `starter/one-component-per-file` enforces both the count and the kebab-case filename match, so a screen is a shell that _imports_ many small named pieces, each in its own file. **Section banner comments are unavailable** — `starter/no-comments` errors on every comment in the tree; the file boundary is the grouping.
2. **Data-driven rendering.** Content lives in typed data (`lib/data/` for seed and copy); JSX maps over it. Types live in `lib/types/`. Recurse when the UI nests.
3. **Build primitives to the house standard**, not shadcn's `data-slot` style: `forwardRef` + explicit `HTMLAttributes<…>` props + `displayName`; variants as typed `Record<Variant, string>` maps composed with `clsx` (no `cva` — it is not installed). The starter ships only `components/ui/button.tsx`; build Card / Modal / Badge / etc. to this standard when needed. House gotcha: **`Button` has no `asChild`/Slot** — for a link, wrap `<Link>` around `<Button>` — and its `size` axis is fixed heights (`sm` `h-8` · `md` `h-9` · `lg` `h-10` · `xl` `h-11`) across three tones (`accent` · `quiet` · `ghost`).
4. **Controlled + uncontrolled duality** where a parent may or may not own state: `const current = value ?? internal`.
5. **Motion through `motion`** (already installed) and the easing tokens; `prefers-reduced-motion` always gets a still equivalent.

## Quality floor

- One radius language per component.
- Hierarchy comes from the text ramp and surface steps before saturated fills.
- Every interactive element has hover, focus-visible and disabled states; every control is keyboard reachable and labelled.
- Animated collapse via `.collapse-grid`, not max-height hacks.
