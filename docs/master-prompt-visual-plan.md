# Master prompt: removing visual prescription

Plan for `docs/MASTER_PROMPT_COMPLETE.md`. **Applied on 2026-09-28** with both recommended decisions: the build hand-off line is in the implementation prompt spec, and only the `next-setup` copy was changed.

## The rule

Added as a top-level Critical Rule:

> **Never prescribe visual design.** No colours, fonts, sizes, spacing, layouts, placement ("banner here", "hero with image"), imagery, animation, visual references or wireframes. Describe what users need, what information and actions each page must offer, and how it behaves — never how it looks or where things sit. The look is decided when each page is built.

## Where the prompt prescribes the look today

| Area | Lines | Today | Change |
| --- | --- | --- | --- |
| Stack › Styling, Styling Architecture Agreement, Styling Separation of Concerns | 73–102, 168–197 | Token-first rules, named classes, "no arbitrary values", `.stat-card` examples | **Remove.** How CSS is written is the host repo's call (`CLAUDE.md` and the skills) |
| Role statement | 28–34 | "Design System Lead, Principal Product Designer… not a landing page" | Keep the product, UX, IA and architecture roles; drop design-system lead and "not a landing page" |
| `{{REFERENCE_PRODUCTS}}` | 9, 34 | Became "feel/register: Linear, Vercel" | Keep, but for **features and flows only**, never look or feel |
| Phase 1 "Design principles" | 247 | Produced "dark by default, one electric accent, Geist" | Rename to **Product principles**: how the product behaves and treats users, with no visual decisions |
| Phase 4 page "Modules" and "Responsive behavior" | 395, 401 | Became "hero banner, featured grid" and "1 col → 3 col" | Replace with **content requirements**: what information and actions the page offers, in priority order, and what users on each device need. No module names that imply layout |
| Phase 5 "Hierarchy", "Animation behavior" and layout | 429, 451 | Produced ASCII wireframes and "one fade" | **Remove.** Keep content model, data, interactions, states and accessibility |
| Phase 6 Component Library | 461–537 | Variants, styling approach, tokens, animation rules; "avoid page-specific components" | Becomes **Interaction contracts**: behaviour, validation, keyboard, ARIA and states only. Which components exist and how they look comes out of the build |
| Phase 7 Design Tokens | 541–607 | Invents the palette, type and motion values | **Delete the phase.** Tokens are chosen at build time, per project |
| Phase 8 "Styling Organization" | 615–640 | The `globals.css` layering | **Remove.** Keep folders, routes, data, state and performance |
| Phase 10 QA | 747 | "Design system compliance", "Consistency" | Functional QA only: accessibility, states, errors, performance, SEO |
| Phase 11 IMPLEMENTATION_PROMPT | 894–950 | Styling principles, styling checklists, component styling template | **Remove** all styling content |
| Frontend Standards | 1016–1039 | "Minimal, Modern, Premium, Spacious… Smooth animations" | Drop the look adjectives. Keep the functional must-haves: loading, empty and error states, keyboard, screen readers, offline |
| `{{THEME_VARIANT}}`, "illustrations" in Output Format | 19, 818, 1124 | Alternate theme and illustrations | **Remove.** Add "no wireframes, mockups or ASCII layouts" |

Removing Phase 7 takes the output from 16 files to 15, so the file lists, cross-links and phase numbering get updated to match.

## Decisions needed

1. **Build hand-off line.** Should the generated implementation prompt say: "The look of each page is decided when it's built: run a concept with the repo's UI skills and get the owner's approval before coding it"? It is process, not look. Recommended: yes, otherwise the builder falls back to defaults.
2. **Which copies to update.** Recommended: the master prompt in `next-setup` only, as the source. Older copies in the travel and fintech repos stay as they are unless you want them synced.
