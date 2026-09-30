# Motion

`motion@12` (the library formerly called Framer Motion) is the animation layer for this starter.
This file is the reference for **what it can do**, **what the starter ships**, and **what stays CSS**.

---

## 1. Entry points

| Import path           | Gives you                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| `motion`              | Vanilla JS: `animate`, `scroll`, `inView`, `stagger`, `spring`                 |
| `motion/react`        | Full React API — `motion.*`, `AnimatePresence`, hooks                          |
| `motion/react-m`      | The `m` component (tree-shakeable, ~5kb with `LazyMotion`)                     |
| `motion/react-client` | Pre-marked `"use client"` — lets `<motion.div>` sit in a Server Component file |
| `motion/mini`         | ~2.5kb `animate`/`scroll` built on native WAAPI                                |

**In this starter:** `motion/react` with the full `motion.*` component. Moving to `m` + `LazyMotion`
is the bundle-size upgrade once a project animates enough to justify it — see §5.

---

## 2. What the starter ships

| Piece                                          | Holds                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `components/wrappers/motion-wrapper.tsx`       | `MotionWrapper` — a `whileInView` fade/offset reveal that plays once                       |
| `lib/constants.ts`                             | `MOTION_DURATION` and `MOTION_SPRING` — the JS-side values; never inline them              |
| `styles/tokens.css`                            | `--durations-*` and `--timing-functions-*` — the CSS-side values                           |
| `styles/globals.css`                           | `@theme` maps the easings to `--ease-*`; durations stay raw variables that `.smooth` reads |
| `styles/tokens.css` › `prefers-reduced-motion` | Collapses CSS animations and transitions to 1ms                                            |
| `components/providers/provider.tsx`            | `MotionConfig reducedMotion="user"` — the same preference, applied to Motion               |

Motion needs numeric seconds and CSS needs its own tokens, so the durations are written once on
each side. `lib/constants.test.ts` fails the moment `MOTION_DURATION` and the `--durations-*`
tokens disagree — change both together. Do not read computed styles at runtime to bridge them.

---

## 3. The ten mechanisms

1. **Enter / exit** — anything that mounts or unmounts: modals, drawers, toasts, removed list
   items, tab panels, skeleton→content. CSS cannot animate an unmount; this is the workhorse.
2. **Layout & shared element** (`layout`, `layoutId`) — FLIP when position or size changes.
   Namespace every `layoutId` (e.g. with `useId()`); two un-namespaced instances on one page share
   an indicator and it flies between them. Prefer `layout="position"` when full `layout` would
   distort content mid-flight.
3. **Gestures** — `whileHover` / `whileTap` / `whileDrag`, drag constraints, `Reorder`. Plain hover
   and press states stay CSS.
4. **Scroll-driven** — `useScroll`, `whileInView`, parallax. `MotionWrapper` lives here. Scroll
   reveal is an editorial device: use it on marketing surfaces, not in application screens.
5. **Motion values** — `useMotionValue` / `useTransform` / `useSpring`: state that bypasses React
   render. Reach for them only when a value updates every frame.
6. **Orchestration** — variants + stagger. Keep staggers short and never stagger data rows that
   re-render on every filter keystroke; that reads as lag, not polish.
7. **SVG & iconography** — path drawing, morphs. Chart libraries usually own their own animation.
8. **Feedback** — spinner crossfades, a row exit that doubles as confirmation, notices that
   collapse in rather than jolt the page.
9. **Vanilla-JS contexts** — `animate` outside React.
10. **Cross-cutting** — interruptible (animations retarget from current velocity), independent
    transforms, opacity/transform handed to WAAPI where supported.

---

## 4. Where it is the wrong tool

- Hover colour/opacity/border transitions → CSS `transition` (`.smooth`)
- Infinite decorative loops (pulsing dots, marquees, shimmer) → CSS `@keyframes`
- Enter-only fades with no exit → CSS animation
- Collapsible height where the content must stay in the SSR HTML → CSS `grid-template-rows: 0fr → 1fr`
- Anything that never unmounts, never moves, and is not pointer- or scroll-driven

Motion earns its bundle on **exit animations, layout transitions, gestures, and scroll-linked
values** — the four things CSS structurally cannot do.

---

## 5. The provider, and growing it

The root provider already wraps the tree in `MotionConfig reducedMotion="user"`, which disables
transforms app-wide for people who ask for reduced motion while keeping opacity fades — the CSS
guard in `tokens.css` does not reach Motion on its own.

When bundle size starts to matter, add `LazyMotion features={domAnimation}` (or `domMax` for layout
animations) to the same provider and switch to the `m` component. Add `strict` so a stray
`motion.*` throws instead of silently loading the full bundle — and migrate `MotionWrapper` in the
same change, or `strict` will break it.

Presets that recur (a row exit, a collapse, a content swap) are promoted to named constants in
`lib/constants.ts`, never restated per component.

### Three gotchas

**1. `HTMLAttributes` vs `HTMLMotionProps`.** Spreading React's `HTMLAttributes<HTMLDivElement>`
onto a `motion.div` fails to compile — React's `onDrag` is a `DragEventHandler`, Motion's is a pan
handler. Extend `HTMLMotionProps<"div">`. Never reach for a cast.

**2. Exit animations need their content to survive.** The common call-site shape is
`open={item !== undefined}` with `{item && …}` inside. Both flip in the same commit, so the exit
plays on an empty box. An overlay primitive holds the last-open children in a ref and renders
those during exit.

**3. Nested `AnimatePresence` blocks exit propagation.** An inner `AnimatePresence` reports its
children as present even while an outer one is exiting. Pass `propagate` on the inner one when the
exit must reach through.

### Known gap: route-change exits

Next's App Router hands the layout its new `children` before the old page unmounts, so
`AnimatePresence` never sees an exiting route. The workaround pins `LayoutRouterContext` — internal
API that Next has broken before. Entrance-only route transitions are the deliberate default.
