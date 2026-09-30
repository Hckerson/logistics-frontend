# Project Instructions

This is a reusable **Next.js App Router starter**. It ships architecture, conventions, and one example per layer as a foundation for new projects.

## Non-negotiable rules

1. **No hardcoding.** API routes, durations, enums, and copy that appears twice live in `lib/constants.ts` or feature-scoped `lib/<feature>/constants.ts`. Endpoints come from `lib/api-routes.ts`, shapes from Zod schemas. Seed and sample data lives in `lib/data/`, never inline in a page.
2. **Match the existing architecture.** Do not invent patterns, and do not invent locations — when you are unsure where something goes, re-read this file. State the reason before deviating.
3. **Use the framework natively.** Next.js and the installed libraries (Query / Zustand / Zod / motion / CSS `clamp()`) cover the need. Do not add a dependency that duplicates one, and do not rebuild what the tool already does.
4. **Single source of truth.** Name a recurring decision once as a semantic token and reference it everywhere. Define once, change in one place.
5. **Minimize LOC.** Ship the shortest solution that stays maintainable.
6. **No `console.log`, `console.error`, or debug statements** in committed code. Logging belongs in services.
7. **Never delete a feature because it is not built.** Unbuilt, stubbed, scaffolded and placeholder are states of work in progress — not evidence the thing was abandoned. This binds specs, seed data, types, primitives, enums, ESLint rules and codemods alike: an export nothing imports yet, a route with no page, a validation schema with no form. Removal needs an explicit instruction naming the feature; if you believe something is genuinely dead, say so and wait. Same rule for generated design OS artifacts — see `docs/MASTER_PROMPT_COMPLETE.md` › Critical Rules › Scope Preservation.

## Required patterns

| Need               | Use                                                                                                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling            | Token-first: named scale classes in `styles/globals.css` (`.pad`, `.pad-x`, `.pad-y`, `.gap`, `.gap-x`, `.gap-y`, `.smooth`) over tokens in `styles/tokens.css`. Style with Tailwind utilities on house tokens, responsive prefixes included; promote a pattern to a named class only when it repeats. Colors and animations are theme tokens.              |
| Component patterns | Reuse `components/ui/` (primitives) and `components/common/` (shared compositions) before writing JSX. A pattern used twice is promoted out of the page that birthed it.                                                                                              |
| Domain types       | Every shared domain type lives in `lib/types/<domain>.ts` and is re-exported by `lib/types/index.ts`. Components import types; they never declare shared ones.                                                                                                        |
| Page composition   | A route `page.tsx` composes sections and holds page-level state — nothing else. Mock/seed data goes to `lib/data/`, JSX blocks to `components/`. No inline data array, no inline sub-component.                                                                       |
| State management   | TanStack Query for server state. `useState` / `useReducer` / URL params for local state. `useSyncExternalStore` + `localStorage` for persistence. A global store requires a stated reason.                                                                            |
| Validation         | Zod schemas in `lib/validations/`. Types derive with `z.infer`. API responses are never loosely typed.                                                                                                                                                                |
| IDs                | `nanoid`. Never `uuid` or `Date.now()`.                                                                                                                                                                                                                               |
| Async flows        | Endpoints in `lib/api-routes.ts`, transport in `lib/api-client.ts`, wrapped in hooks in `lib/hooks/use-<resource>.ts`. Components consume hooks — never call the client directly. A hook for an authenticated call wraps a Server Action from `lib/actions/` instead. |

## Folder Structure

| Route                   | Immediate Subfolders                                                                    | Purpose                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/app`                  | `api/session` • `api/register` • `auth/login`                                           | App Router routes. Pages compose — they do not define data or components. Nesting here is the URL, not a choice: a route handler or page must sit at the path it serves. |
| `/components/ui`        | _(flat)_                                                                                | Generic, domain-free primitives. Reusable in any app.                                                                                                                    |
| `/components/common`    | _(flat)_                                                                                | Shared compositions over primitives.                                                                                                                                     |
| `/components/wrappers`  | _(flat)_                                                                                | Behavioural wrappers (motion, boundaries).                                                                                                                               |
| `/components/providers` | _(flat)_                                                                                | React context providers.                                                                                                                                                 |
| `/lib`                  | `actions` • `contract` • `data` • `enums` • `hooks` • `types` • `utils` • `validations` | Core logic layer. No JSX. Transport lives in `api-client.ts` + `api-routes.ts`.                                                                                          |
| `/design-os`            | `generated`                                                                             | Generated design OS output. The seed prompt itself is `docs/MASTER_PROMPT_COMPLETE.md`. Not application code.                                                            |
| `/public`               | `fonts`                                                                                 | Static assets.                                                                                                                                                           |
| `/styles`               | _(flat)_                                                                                | Global styles and token exports.                                                                                                                                         |
| `/tools/eslint`         | `rules`                                                                                 | Custom ESLint rules that enforce the conventions in this file. Not app code.                                                                                             |
| `/tools/codemods`       | _(flat)_                                                                                | ts-morph codemods that rewrite violations the rules report. Not app code.                                                                                                |
| `/tools/contract`       | _(flat)_                                                                                | Generator that turns the backend's OpenAPI document into `lib/contract/`.                                                                                                |

Add `lib/data/` (seed data) and `lib/constants.ts` on first use — the rules above assume those homes.

Conventions in this file that can be checked mechanically belong in `tools/eslint/rules/` as a rule with a colocated `.test.ts`, registered by the `starter` plugin in `eslint.config.ts`. Where flat config already expresses the constraint (`no-restricted-imports` and friends), use config — a custom rule must earn itself by needing scope or path analysis config cannot reach.

A rule that reports a violation ESLint cannot autofix — because the fix spans files — gets a matching codemod in `tools/codemods/`, also with a colocated `.test.ts` driven by an in-memory ts-morph project. Codemods are dry-run by default and only write under `--write`. When a transform would have to guess intent, it skips the call and reports the reason instead.

## The contract layer

`lib/contract/` is **generated — never edit it**. The backend's class-validator DTOs are the origin; `pnpm openapi` in `nest-setup` emits `openapi.json`, and `pnpm contract` here turns that into Zod schemas, `z.infer` types, and typed route builders. Change a field on a DTO, regenerate, and `pnpm type-check` fails here at every consumer — that break is the point of the layer.

Regeneration is not left to memory: `pnpm contract:check` regenerates in place, diffs against `lib/contract/`, and fails when the two disagree.

Every route builder returns an `Endpoint<TResponse>` — a branded string carrying the response type the backend documents for that operation. `query.get(routes.usersFindOne(id))` therefore resolves to `ApiResponse<UserResponseDto>` with no type argument at the call site. A response type reaches the contract only when its controller method is annotated with `@ApiEnvelope(Dto)` in `nest-setup`; without that annotation the endpoint degrades to `Endpoint<unknown>`.

Import request shapes and endpoints from `@/lib/contract`, not by hand. `lib/api-routes.ts` remains for endpoints the backend does not publish. Hand-written Zod in `lib/validations/` composes over the generated schemas (`.extend`, `.pick`) rather than restating them.

## File rules

- **One component per file.** Kebab-case filename matching the export (`motion-wrapper.tsx` → `MotionWrapper`).
- **Absolute imports via `@/`.** Never deep-relative (`../../../lib/...`).
- **Any file over ~150 lines gets split**, `page.tsx` included. Data moves to `lib/data/`, JSX to `components/`.

## Before you commit or push

Git hooks are **disabled**. `.husky/` is kept but not installed: the `prepare` script unsets `core.hooksPath` on every `pnpm install`, so nothing runs on commit or push.

- **Commit** — `.husky/pre-commit` would run `pnpm lint-staged`: `eslint --fix` then `prettier --write`, over staged files only.
- **Push** — `.husky/pre-push` would run `pnpm type-check`, then `pnpm lint`, then `pnpm contract:check`.

Run those by hand when you want the gate. To re-enable the hooks, set `prepare` back to `husky` and run `pnpm install`.

The rules above are not restated here. They bind every edit, not the gate.
