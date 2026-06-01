# UIUXQuiz.md
## QuizAI — Complete UI/UX Redesign Strategy & Implementation Report
**Document Type:** Senior Product Design Report (Code-Verified)
**Version:** 2.0 | June 2026
**Supersedes:** v1.0 (May 2026)
**Scope:** Full frontend redesign — UI, UX, design system, responsiveness, accessibility, visual polish
**Hard Constraint:** No backend, API, Firebase, Gemini, auth, or business-logic changes. UI / UX / design-system only.

---

> **About this version.** v1.0 was written from a reading of the codebase. v2.0 re-audits every frontend
> file directly (7 parallel readers over 70+ files) and **reconciles the plan against what the code actually
> does today.** Several v1.0 claims describe problems that have since been fixed in the live code, and the
> audit surfaced several real problems v1.0 missed. Where v2.0 corrects v1.0, it says so explicitly in a
> **Reality Check** callout. This document is the single source of truth for implementation. Read it fully
> before editing any file.

---

## Table of Contents

1. [Verification Method & Reality Checks](#1-verification-method--reality-checks)
2. [Research Findings — Modern SaaS Products](#2-research-findings--modern-saas-products)
3. [Current UI Audit](#3-current-ui-audit)
4. [Current UX Audit](#4-current-ux-audit)
5. [Why QuizAI Still Reads "AI-Generated"](#5-why-quizai-still-reads-ai-generated)
6. [Design Direction & Principles](#6-design-direction--principles)
7. [Design System Specification](#7-design-system-specification)
8. [Color System](#8-color-system)
9. [Typography System](#9-typography-system)
10. [Glassmorphism Implementation Guidelines](#10-glassmorphism-implementation-guidelines)
11. [Spacing, Radius, Elevation, Motion](#11-spacing-radius-elevation-motion)
12. [Component Architecture Decisions](#12-component-architecture-decisions)
13. [Navigation Redesign](#13-navigation-redesign)
14. [Landing Page Redesign](#14-landing-page-redesign)
15. [Dashboard Redesign](#15-dashboard-redesign)
16. [Profile Page Redesign](#16-profile-page-redesign)
17. [Leaderboard Redesign](#17-leaderboard-redesign)
18. [Quiz Experience Redesign](#18-quiz-experience-redesign)
19. [Settings Page (New)](#19-settings-page-new)
20. [Loading, Empty & Error States](#20-loading-empty--error-states)
21. [Mobile Design Decisions](#21-mobile-design-decisions)
22. [Desktop Design Decisions](#22-desktop-design-decisions)
23. [Responsiveness Decisions](#23-responsiveness-decisions)
24. [Accessibility Decisions (WCAG 2.1 AA)](#24-accessibility-decisions-wcag-21-aa)
25. [Before vs After](#25-before-vs-after)
26. [Implementation Roadmap (8 Phases)](#26-implementation-roadmap-8-phases)
27. [Validation Checklist](#27-validation-checklist)
28. [Agent Execution Rules](#28-agent-execution-rules)

---

## 1. Verification Method & Reality Checks

The codebase was audited with a fan-out of seven read-only agents, one per surface area
(design-system, navigation, landing, dashboard, profile/leaderboard, quiz, shared/auth/result),
each instructed to quote exact className strings and report only what exists. The findings below are
grounded in that audit plus direct reads of every file this plan edits.

**Stack (verified from `package.json`):** Next.js 15 (App Router) · React 19 · Tailwind CSS v4
(`@theme inline`, OKLCH tokens) · base-ui primitives (`@base-ui/react`) wrapped as shadcn-style components ·
Framer Motion 12 · Recharts 3 · TanStack Query 5 · next-themes · sonner · lucide-react.

> ### 🔎 Reality Check — v1.0 claims that are already resolved in live code
> These were listed as open problems in v1.0. The current code already handles them. **Do not "fix" them again** —
> doing so risks regressions. Verify, then leave alone (or only polish).
>
> | v1.0 claim | Actual state in code |
> |---|---|
> | "Review page never shows explanation text" | `quiz/review/[id]/page.tsx:277` **already renders** `answer.question.explanation`. Only needs visual restyle to match the design system. |
> | "ProgressBar has no mount animation" | `dashboard/progress-bar.tsx:64` **already** animates width with Framer Motion. |
> | "Profile children lack `min-w-0`" | `profile/page.tsx` **already** has `min-w-0` on the root, header card, and stats wrapper. |
> | "Stats numbers lack `tabular-nums`" | `StatsCard`, profile table, leaderboard, chart tooltip **already** use `tabular-nums`. |
> | "Hero timer uses `animate-spin` (a spinner that never loads)" | The hero preview uses `animate-pulse` / `animate-bounce`, **not** `animate-spin`. The actual issue is a static `0:24` with decorative bounce — restyle, don't "stop the spinner." |
> | "Dashboard chart collapses to 0px" | `PerformanceChart` wraps Recharts in a fixed `h-64` div, so it does not collapse. The real chart issues are (a) hardcoded `h-64` with no responsive height and (b) `margin.left = -20` clipping the Y-axis on narrow screens. |
> | "Profile analytics needs explicit pixel height" | Container is `min-h-[300px]` and the chart is `h-64` inside it — it renders. Keep `min-h`, add an explicit height only to remove the pre-mount jump. |

> ### 🆕 Reality Check — real problems v1.0 missed (found in audit)
> | Issue | Location | Why it matters |
> |---|---|---|
> | **Stale backup stylesheet** with a *different* heading font (`Outfit` vs `Manrope`) | `app/globals_backup.css` | Font ambiguity; risk a teammate imports the wrong file. Should be deleted. |
> | **Orphan `header.tsx`** with hardcoded tabs ("Explore/Community/Documentation"), a fake search bar, and a notification bell that `animate-pulse`es **regardless of unread state** | `components/layout/header.tsx` | Looks like a template artifact. Either unused (delete) or misleading (fix). Verify imports before acting. |
> | Fabricated stat **duplicated with conflicting labels**: "2,000+ Active learners" (hero) vs "2,000+ developers" (CTA) | `hero.tsx:81`, `cta-section.tsx:32` | Trust damage + audience mismatch ("developers" — QuizAI is for general students). |
> | `StatsSkeleton` uses `md:grid-cols-3` but real `DashboardStats` uses `sm:grid-cols-3` | `stats-skeleton.tsx:5` | Layout shift between loading and loaded at the 640–767px range. |
> | Chart `margin.left: -20` | `performance-chart.tsx:39` | Y-axis labels clip off the left edge on small screens. |
> | Mobile drawer hardcoded `w-[260px]` | `mobile-nav.tsx`, `navbar.tsx` | On 320px phones this leaves little room and risks content overflow. |
> | `recent-activity` color squares show a single letter with **no text alternative**; list isn't semantic | `recent-activity.tsx` | Screen-reader announces an empty box. |
> | Login labels are `text-[11px] uppercase` | `login/page.tsx` | Borderline-illegible; error block lacks `role="alert"`. |
> | `globals.css` media queries define **sm (48rem) and lg (64rem)** only — **no `md`** | `globals.css:177-197` | Source of the recurring "missing md breakpoint" across pages. |

The audit's headline conclusion matches v1.0's thesis: **the product is technically sound but visually
undifferentiated** — glass is applied uniformly (so it stops signalling hierarchy), ambient gradient orbs
appear on every page, the two-font system is barely expressed, and several sections carry developer-template
copy. The redesign is therefore mostly *subtractive and systematizing*, not a rebuild.

---

## 2. Research Findings — Modern SaaS Products

We studied nine reference products. Each contributes a specific, transferable pattern; we deliberately
take *one or two ideas* from each rather than cloning any.

**Linear (primary, ~40%).** The defining qualities are *restraint and rhythm*: generous whitespace, an
8px grid everything snaps to, near-monochrome surfaces with a single accent, tabular/monospace treatment
for IDs and metadata, and a sidebar that is quiet by default. The lesson for QuizAI: **let space — not
borders and glass — create hierarchy**, and give numbers (scores, XP, ranks) tabular alignment so columns
read like a ledger.

**Perplexity (~20%).** AI identity is *expressed*, not hidden: the "thinking" state is a designed moment,
dark surfaces imply depth and intelligence, and sources are presented as trustworthy artifacts. Lesson:
the **"AI is generating your quiz" state should be a beautiful, legible sequence**, not a bare spinner.

**Duolingo (~20%).** Gamification is *ambient and emotional*: the streak is always on screen, XP is never
buried, and completion is celebrated. Lesson: **streak + level must be visible from every page** (sidebar
+ mobile header), and finishing a quiz must feel rewarding (count-up score, XP float, confetti on a strong
result, reliable level-up modal).

**Notion (~20%).** *Content-first calm*: one purpose per page, hierarchy through whitespace, the UI
recedes. Lesson: **the dashboard needs one clear primary action**, not eight equal-weight widgets.

**Vercel.** Dark mode is the design, not an afterthought; subtle dot/grid backgrounds add depth without
noise; typography contrast between heading and body is dramatic; status is communicated consistently with
color. Lesson: **replace gradient-orb "soup" with one subtle, consistent page texture** and widen the
display-vs-body type contrast.

**Stripe & Clerk.** Dashboards read as instruments: a *dominant* primary metric, secondary metrics
subordinate, immaculate form and input states, and a strict, documented component vocabulary. Lesson:
**one stat (current streak or rank) should be visually dominant**; inputs, focus rings, and disabled
states must be uniform across the app.

**Supabase.** A coherent dark developer aesthetic with green-accented status and dense-but-legible tables.
Lesson: **tables get real structure** (sticky-feeling headers, perceptible row hover, a scroll affordance)
rather than glass frosting.

**Arc Browser & Raycast.** Personality through *signature interactions* — the command palette, spaces,
boosts. Lesson: QuizAI needs at least one **signature moment** users associate with the product. We choose
two low-cost ones: the **always-present streak flame** in the chrome, and the **AI generation sequence**.

**Synthesis.** "Focused Intelligence": Linear's discipline as the skeleton, Perplexity's AI legibility and
Duolingo's reward loop as the emotional layer, Notion's content-first focus as the editing principle.
Premium, calm, intelligent, rewarding — never neon, cluttered, or childish.

---

## 3. Current UI Audit

**Design tokens — strong, keep.** `globals.css` defines a clean OKLCH system across three tiers:
primitives (`--primary` indigo, `--success`, `--warning`, `--destructive`), semantic tokens
(`--background`, `--card`, `--muted`, `--border`, `--ring`), and component tokens (`--sidebar-*`). Dark
mode is a full override, not a filter. **No token values change in this redesign.**

**Primitives — solid, keep.** `Button` (base-ui + CVA) exposes six variants
(`default·outline·secondary·ghost·destructive·link`) and a full size scale (`xs·sm·default·lg·icon*`),
with a consistent focus ring and `aria-invalid` handling. `Card`, `Tabs` (pill + line variants), `Badge`,
`Input`, `Dialog`, `Tooltip`, `Progress`, `Sheet`, `Skeleton` are all base-ui-backed and accessible.
`font-heading` is used widely but relies on the CSS variable rather than a Tailwind `fontFamily` entry —
functional but implicit; we make it explicit.

**The four systemic UI problems.**

1. **Glass-on-everything.** `glass-card` / `glass-card-hover` are applied to *content* surfaces —
   `StatsCard`, dashboard chart & activity panels, the daily-quiz widget cards (triple-stacked:
   `glass-card glass-card-hover border-border/10 bg-card/20`), the leaderboard table & podium, landing
   feature/step/CTA cards, the footer, even the empty/no-data states. When every surface frosts, none
   floats. Glass stops meaning "elevated."

2. **Gradient-orb soup.** Absolutely-positioned blurred orbs appear on the hero (×3), features (×2),
   how-it-works, CTA, the platform shell, the dashboard page, the leaderboard, and the quiz catalogue.
   The effect is identical everywhere, so it adds noise, not depth.

3. **Two-font system barely expressed.** Manrope (`--font-heading`) only shows where `font-heading` is
   explicitly set. Many platform headings are `text-2xl font-bold` in Inter — so display/body contrast is
   weak and the UI feels flat. (Also: `globals_backup.css` declares `Outfit` for the same variable — delete it.)

4. **Breakpoint gaps.** `globals.css` only defines sm/lg media steps; component grids repeatedly jump
   `1-col → 3-col` at `sm` or `1-col → 2-col` at `lg`, skipping `md` (768–1023px, i.e. most laptops/tablets).
   Examples: dashboard main grid `lg:grid-cols-[55fr_45fr]` (no `md`), `DashboardStats` `sm:grid-cols-3`
   vs skeleton `md:grid-cols-3`, profile stats `md:grid-cols-3 xl:grid-cols-5` (uneven 3+2 row at md),
   daily-quiz widget `grid-cols-2` with no mobile fallback.

**Layout-specific findings.**
- **Profile achievements** use `flex flex-wrap` with `min-w-[220px] flex-1` cards — uneven last row and
  overflow pressure. Should be a true grid.
- **Profile stats** `grid-cols-1 md:grid-cols-3 xl:grid-cols-5` → at md, five cards become 3+2 (lonely pair).
- **Leaderboard podium** uses `md:scale-105` on rank 1 inside `md:grid-cols-3` — transform-based scaling
  invites clip/overlap; height differentiation is safer.
- **Leaderboard table hover** is `hover:bg-primary/[0.03]` — 3% is imperceptible on most displays.
- **Chart** hardcodes `h-64` (no responsive height) and `margin.left:-20` (Y-axis clip on mobile).
- **Mobile header** carries four interactive controls (logo, theme, avatar, hamburger) in a 56px bar.

---

## 4. Current UX Audit

**New-user journey:** `Landing → Login → Dashboard (empty) → Quiz Stream → Topic → Play → Result`.
Login is smooth, but the **empty dashboard is intimidating** — multiple zeroed stat cards and competing
widgets with no single obvious next step. Eight surfaces render at once (welcome, onboarding CTA, stats,
level banner, chart, recent activity, daily quests, skill breakdown). There is no progressive disclosure.

**Returning-user journey:** `Dashboard → Daily Quests → Category → Play → Result`. The daily-quiz cards
are now fully clickable (good — the whole card is a `Link`). The gaps are at the *end* of the loop:
completion is informational, not celebratory; there is no "suggested next quiz."

**Content-hierarchy issues.** The dashboard and profile both try to do everything in one view with
equal visual weight. Nothing is dominant, so the eye has no entry point. The fix is **zoning** (Now /
Trend / Actions) and a single dominant element per page.

**Gamification is page-local.** Streak/level/XP live only on the dashboard and profile. A user on the
leaderboard or mid-quiz has no idea what their streak is — the opposite of the Duolingo lesson.

**Copy problems (trust + audience).** Developer-template strings survive in production:
"From Junior to Staff Engineer," "technical screens," "Choose your stack … Rust and Go to React and
GraphQL," a literal `<span>CTA</span>` label, "2,000+ developers," and a backend leak in the profile
error state ("Make sure the backend server is running on port 5000"). QuizAI serves general students;
this copy is both wrong and credibility-eroding.

---

## 5. Why QuizAI Still Reads "AI-Generated"

1. **Structural sameness.** Every section is *title → subtitle → grid of cards*. No section breaks the
   mold; there is no rhythm or surprise.
2. **Ambient glow without purpose.** The same orb pattern on every page — when everything glows, nothing does.
3. **Uniform glass.** Identical frosting on all surfaces erases hierarchy.
4. **Unexpressed type system.** Two fonts loaded, contrast not used.
5. **Spacing without rhythm.** `space-y-4` / `gap-4` for nearly everything → uniform density, no emphasis.
6. **Neutral CTAs.** Correct but personality-free.
7. **No signature moment.** Nothing a user would point to and say "that's QuizAI."

The redesign attacks all seven: break structural sameness with zoning and a bento accent; replace orbs
with one quiet texture; reserve glass for floating chrome; express Manrope on every H1/H2; introduce a
spacing scale with intentional section gaps; give CTAs a confident, consistent treatment; and ship two
signature moments (the persistent streak flame and the AI generation sequence).

---

## 6. Design Direction & Principles

**Direction: "Focused Intelligence" — 40% Linear · 20% Perplexity · 20% Duolingo · 20% Notion.**
QuizAI's users are students preparing for exams and competitive tests. They must feel **competent and in
control**. The UI should read as a precise instrument that respects their intelligence and rewards effort.

**Six operating principles (every decision traces to one):**

1. **Content leads, chrome recedes.** The question, the score, the progress bar fill the visual field; the
   sidebar, borders, and cards stay quiet.
2. **Progress is always visible.** Streak, level, and today's XP are reachable from any page (sidebar +
   mobile header), never buried in a tab.
3. **One primary action per page.** Dashboard → start today's quiz. Play → answer. Don't let elements
   compete for the same attention.
4. **Space creates hierarchy.** Whitespace between *sections* (24–32px), not just between cards (16px),
   communicates structure without adding ink.
5. **Celebrate wins generously.** Finishing, levelling up, and keeping a streak should feel earned.
6. **Glass has exactly one job** — marking elements that float above the page substrate (chrome, overlays,
   the active quiz card). Never on content cards, tables, or sections.

**Explicitly avoid:** neon/cyberpunk, gradient excess, heavy shadow stacks, glass-on-everything, oversized
cards, cluttered dashboards, and any "generic SaaS template" reading.

---

## 7. Design System Specification

The system stays Tailwind v4 + OKLCH tokens. We *systematize usage* and add four utilities so intent is
expressed in one class rather than re-typed per file.

**New utilities (add to `globals.css` `@layer utilities`):**

```css
/* Content surface — the default for ALL content cards (replaces ad-hoc glass on content) */
.card-base        { @apply bg-card border border-border rounded-xl; }
/* Interactive content surface — adds a calm hover, no transform (avoids layout shift) */
.card-interactive { @apply card-base transition-colors duration-150 hover:border-primary/30; }
/* Canonical numeric treatment for scores / XP / ranks / timers */
.stat-number      { @apply tabular-nums font-semibold tracking-tight; }
/* Right-edge fade affordance for horizontally-scrollable tables */
.scroll-fade-x::after {
  content: ""; position: absolute; inset-block: 0; right: 0; width: 2rem;
  background: linear-gradient(to left, var(--card), transparent); pointer-events: none;
}
```

Also add the missing **`md` breakpoint** to the `globals.css` responsive utilities, and keep
`--font-heading` registered in the `@theme` block so `font-heading` resolves predictably rather than
implicitly:

```css
@theme inline {
  --font-heading: "Manrope", sans-serif;   /* already present — keep */
  /* font-sans inherits Inter via --font-sans on <html> */
}
```

**Glass utilities stay defined** (`glass-card`, `glass-sidebar`, `glass-header`, `glass-surface`) — we
simply stop applying `glass-card` to content. `glass-sidebar`/`glass-header`/`glass-surface` remain in use
for chrome and overlays.

**Token tiers (unchanged values):**
- **Tier 1 — primitives:** `--primary` (indigo `oklch(0.55 0.18 264)`), `--success`, `--warning`, `--destructive`.
- **Tier 2 — semantic:** `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--input`, `--ring`.
- **Tier 3 — component:** `--sidebar*`.

**Cleanup:** delete `app/globals_backup.css` (conflicting `Outfit` font). Resolve `components/layout/header.tsx`
(delete if unused; otherwise wire the notification pulse to real state and remove placeholder tabs/search).

---

## 8. Color System

Token *values* are excellent and modern; the redesign governs **how color is used** so that color keeps
meaning. Color communicates state — protecting its semantics is the rule.

| Role | Reserved for | Never for |
|---|---|---|
| **Primary (indigo)** | active nav, primary CTA, default progress, active tab indicator, streak/level highlight in chrome | body text, non-interactive backgrounds |
| **Success (green)** | correct answers, streak maintained, achievement unlocked, accuracy ≥ 70% | decorative fills |
| **Warning (amber)** | streak at risk, accuracy 50–70%, timer < 10s, rank-1 gold | generic emphasis |
| **Destructive (red)** | wrong answers, accuracy < 50%, errors, destructive confirmations | hover states |
| **Muted** | secondary text, placeholders, disabled, non-interactive borders | primary information |

**Rules.** Never `text-primary` for body copy. Never `bg-primary` for non-interactive elements. Any
status conveyed by color must **also** carry a non-color cue (icon, label, or shape) for accessibility
(see §24). Status text on tinted surfaces must clear 4.5:1 in both themes (verify amber-on-card and
success-on-card in dark mode — the audit flagged these as at-risk).

---

## 9. Typography System

Inter (`--font-sans`) for body, Manrope (`--font-heading`) for display/headings. The goal is **dramatic,
consistent contrast** between the two.

```
Display   text-hero        clamp(2.25rem → 4.5rem)   font-heading 700   tracking-[-0.03em]   (landing hero only)
H1        text-2xl/3xl     1.5–1.875rem              font-heading 700   tracking-tight       (page titles)
H2        text-xl          1.25rem                   font-heading 600                          (section titles)
H3        text-base        1rem                      font-heading 600                          (card titles)
Body      text-sm/base     0.875–1rem                font-sans 400      leading-relaxed
Caption   text-xs          0.75rem                   font-sans 400      text-muted-foreground
Numeric   .stat-number     —                         tabular-nums                              (scores/XP/rank/timer)
```

**Rules.** Every page `<h1>`/`<h2>` carries `font-heading`. Every score, XP, rank, percentage, and timer
uses `tabular-nums` (most already do — finish the long tail). Avoid `text-[11px]` and below for anything a
user must read; login labels move to `text-xs`/`text-sm` (see §24).

---

## 10. Glassmorphism Implementation Guidelines

Glass marks **floating** elements only. This is the single most repeated rule because it is the single
biggest contributor to the "AI-generated" reading.

**✅ Glass allowed (keep):**
1. Platform mobile header — `glass-header` (it floats fixed over scrolling content).
2. Desktop sidebar — `glass-sidebar`.
3. Marketing navbar (scrolled state) and its mobile sheet — `glass-header` / `glass-surface`.
4. Modals, dialogs, sheets, the level-up celebration, toasts.
5. The **active quiz question card during play** (one elevated interaction moment) — optional accent.
6. The hero's secondary "See How It Works" button (a single floating highlight).

**❌ Glass removed → replace with `card-base` / `card-interactive`:**
- `StatsCard` (`stats-card.tsx`) and all dashboard panels (chart, recent activity, skill breakdown, daily-quiz widget, welcome banner, level banner).
- Dashboard onboarding/empty/no-data cards → `bg-primary/5 border border-primary/20 rounded-xl` (onboarding) or `card-base border-dashed` (no-data).
- Landing feature cards, how-it-works steps, the footer inner container.
- Leaderboard **table container and podium cards** → `card-base` (+ `overflow-hidden` on the table wrapper).
- Quiz catalogue cards (`quiz/page.tsx`) and the daily-quiz widget cards → `card-interactive`.
- CTA section container → `card-base` is acceptable; if glass is kept it must be the *only* glass on that page and the surrounding orb removed.

**Rationale.** The sidebar/navbar float (always above content), modals float (above everything), the active
quiz card floats (the elevated moment). Feature cards, stat cards, and tables are *content* — they sit in
the page. Removing glass from content is what restores hierarchy.

---

## 11. Spacing, Radius, Elevation, Motion

**Spacing scale (8px base).** Internal card padding `p-4` (compact) / `p-5`–`p-6` (standard). Related
elements `space-y-4` (16px). **Between sections `space-y-6`/`space-y-8` (24–32px)** — this is how space
creates hierarchy. Grid gaps `gap-4`; reduce to `gap-3` on the smallest breakpoint where noted.

**Radius.** Chips/badges `rounded-md`/`rounded-full`; content cards `rounded-xl` (12px); large
containers/modals `rounded-2xl` (16px). This is already consistent — keep it.

**Elevation.** Content cards: **border only, no shadow** (`border-border`). Elevated chrome
(modals, dropdowns): `shadow-md`. Primary CTAs may use `shadow-lg shadow-primary/20`. Retire stacked
shadows on content (e.g. leaderboard table `shadow-md`, CTA `shadow-xl`) in favor of the border system.

**Motion timing.** Instant feedback 0–100ms (hover/focus) · quick transitions 100–200ms (color/opacity) ·
page transitions 200–300ms · modal entrance 300–400ms · celebrations 500–1000ms.
**Easing:** standard `cubic-bezier(0.16, 1, 0.3, 1)` (already used) · spring for level-up · `ease-out` for pages.
**New motions:** score count-up on completion (300ms), "+XP" float-and-fade, progress-bar fill on mount
(already present in `ProgressBar` — extend to all bars), confetti on score ≥ 80%.
**Constraints:** prefer `transform`/`opacity`; avoid continuous animation of `box-shadow`/`filter`; replace
`glass-card-hover`'s `translateY(-3px)` (layout-shift risk) with border-color hover via `card-interactive`;
honor `prefers-reduced-motion: reduce` everywhere (gate Framer entrance/celebration animations).

---

## 12. Component Architecture Decisions

**Keep as the vocabulary** (no API churn): `Button`, `Card`, `Tabs`, `Badge`, `Input`, `Dialog`, `Tooltip`,
`Progress`, `Sheet`, `Skeleton`. Standardize *usage*, not the components.

**Refactor in place:**
- `StatsCard` — drop `glass-card glass-card-hover` → `card-base`; add an optional `variant`/`accent` prop
  (`default | streak | rank`) for the dominant-metric treatment; guard long values (`truncate`).
- `WelcomeBanner` — `card-base`; keep inline streak/XP; ensure button `w-full sm:w-auto` can't overflow.
- `DailyQuizWidget` / quiz catalogue cards — single `card-interactive` (remove triple glass stacking).
- `PerformanceChart` — responsive height (`h-56 sm:h-64`), fix `margin.left` (−20 → 0), add `aria-label`/summary.
- `recent-activity` — semantic `<ul>/<li>`; `aria-label` on the letter avatar; `title` on truncated text.

**Create (small, reusable):**
| Component | Purpose |
|---|---|
| `components/shared/streak-badge.tsx` | Compact streak for sidebar + mobile header (expanded & collapsed). |
| `components/shared/xp-mini-bar.tsx` | Mini level + XP progress for the sidebar. |
| `components/shared/scroll-fade.tsx` | Right-edge gradient affordance for scrollable tables. |
| `components/quiz/adaptive-context-label.tsx` | "🎯 Targeting weak area: X" above quiz options. |
| `components/quiz/quiz-celebration.tsx` | Confetti on score ≥ 80% (respects reduced-motion). |
| `components/shared/stat-tile.tsx` *(optional)* | Shared empty/loading-safe metric tile if `StatsCard` variants aren't enough. |

**Provide streak/level to chrome without touching business logic.** The dashboard query
(`getUserDashboard`) already returns `profile` (level, xp, xpToNextLevel) and `stats` (currentStreak).
Surface these to the sidebar/mobile header by reading the **same TanStack Query cache** (`useQuery(['dashboard'])`)
inside `StreakBadge`/`XpMiniBar` — read-only, no new endpoints, no logic change. If `data` is undefined, the
components render nothing (graceful).

---

## 13. Navigation Redesign

**Current:** desktop `Sidebar` (`glass-sidebar`, collapse persisted to localStorage, 56/220px), mobile
fixed `glass-header` with four controls, `MobileNav` sheet (`w-[260px]`). Active state shows a left-border
**only when expanded**; collapsed mode has no active indicator beyond icon color. No streak/level anywhere.

**Decisions.**

**Sidebar — expanded (220px):** brand → nav links → **new streak + mini-XP block** (above the bottom bar)
→ compact theme/logout/collapse. Active link: `bg-primary/8 text-primary` + 2px left border. Logout is
sized to match nav links (currently oversized).

```
┌──────────────────────┐
│ ✦ QuizAI             │  brand (14px semibold, font-heading)
├──────────────────────┤
│ ▸ Dashboard          │  active = left-2px border + bg-primary/8
│   Quizzes            │
│   Leaderboard        │
│   Profile            │
├──────────────────────┤
│ 🔥 12 day streak     │  StreakBadge (NEW, always visible)
│ Lvl 6 ▓▓▓▓░ 500 XP   │  XpMiniBar (NEW)
├──────────────────────┤
│ ☼ theme   ⎋ logout   │  compact bottom bar
└──────────────────────┘
```

**Sidebar — collapsed (56px):** icons only, each with a tooltip; **active state gets a left-border in
collapsed mode too** (fixes the audit finding) and `aria-current="page"`. Streak shows as a flame icon with
a tooltip ("12 day streak").

**Mobile header — reduce 4 → 3 controls.** Drop the avatar link (profile is reachable from the hamburger);
show **brand + streak/level chips + hamburger**. Streak/level become always-visible on mobile.

```
┌─────────────────────────────────┐
│ ✦ QuizAI      🔥12  L6      ☰    │
└─────────────────────────────────┘
```

**Mobile drawer:** widen safely — `w-[min(20rem,100vw-3rem)]` (replaces fixed `w-[260px]`) so 320px phones
keep a safe gutter. Add `aria-label`/description to the sheet.

**Files:** `components/layout/sidebar.tsx`, `app/(platform)/layout.tsx`, `components/layout/mobile-nav.tsx`,
plus new `streak-badge.tsx` / `xp-mini-bar.tsx`.

---

## 14. Landing Page Redesign

**What works (keep):** benefit-led hero headline, two-CTA hierarchy, the React `HeroProductPreview` mockup,
the feature set, the 3-step structure.

**Fixes (verbatim copy + structure):**
1. **Orb reduction.** Remove per-section orbs; allow **at most one** subtle texture for the whole page
   (a faint dot-grid or a single low-opacity gradient on the hero only). Net: from ~9 orbs → ≤1.
2. **CTA placeholder.** Replace `<span>CTA</span>` (`cta-section.tsx:26`) with `Start free today`. Add a
   reassurance line: *"No credit card. No time limit. Always free."*
3. **Audience copy.** `features.tsx`: "From Junior to Staff Engineer" → "From beginner to advanced";
   "technical screens" → "exam-style pressure." `how-it-works.tsx`: "Choose your stack … Rust and Go to
   React and GraphQL" → "Choose your subject … from general knowledge and aptitude to tech and maths."
4. **Fabricated stats.** Reconcile the conflicting "2,000+ learners" / "2,000+ developers." Prefer
   **claim-based, true statements** over invented metrics: replace the numeric stat row with a trust bar —
   *"AI-powered questions · Adaptive to your level · New quizzes daily · Free forever."* If real metrics
   exist, use them; otherwise do not fabricate.
5. **Glass.** Feature/step/footer cards → `card-base`. Keep the hero's single glass secondary button.
6. **Hero preview.** Keep the mockup; the timer is a static `0:24` (no spinner to remove) — calm the
   decorative `animate-bounce`/`animate-pulse` to a single subtle accent; bump sub-12px mockup text where
   it conveys meaning; add `aria-hidden` to purely decorative dots.
7. **Breakpoints.** Add `sm:` to grids that jump `1 → md:3` (hero preview, how-it-works) so tablets get 2 columns.
8. **Pricing page** (`app/pricing/page.tsx`): add `sm:` to `md:grid-cols-2`; make the "Most Popular" badge a
   semantic element; add responsive padding.

**New trust bar** sits between Features and How-It-Works (single line, `card-base` or borderless).

---

## 15. Dashboard Redesign

**Reorganize from a flat 8-widget grid into three zones** (Now / Trend / Actions), which is the Stripe/
Notion lesson applied. Fix the breakpoint gaps and remove glass.

**Zone 1 — "Right Now"** (`WelcomeBanner`, `card-base`): greeting + inline `🔥 streak · Level · XP today`
+ a single dominant **Start Quiz** CTA. This is the page's one primary action.

**Zone 2 — "Your Numbers"** (`DashboardStats`): keep **4** cards — Quizzes, Avg Score, Current Streak, Rank.
The streak card gets the accent variant (`border-warning/40 bg-warning/5`) when streak > 0, making it the
dominant metric. Grid: `grid-cols-2 md:grid-cols-4` (no more `1 → sm:3` jump; no lonely 5th card). **Skeleton
must match** (`stats-skeleton.tsx` → `grid-cols-2 md:grid-cols-4`, taller tiles).

**Zone 3 — "Trend + Activity"** (2-col from `md:`):
```tsx
// was:  grid-cols-1 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]   (skips md)
// now:  grid-cols-1 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]
```
The chart panel and recent-activity panel become `card-base`. The right column's inner
`sm:grid-cols-[3fr_2fr]` split is removed (it cramped both panels at 640px); stack them or let the zone
grid own the split.

**Zone 4 — "Today's Quizzes + Skills"** (`DailyQuizWidget` + `SkillEquilibrium`):
`grid-cols-1 md:grid-cols-2 lg:grid-cols-[40fr_60fr]` (already correct — keep). Widget cards → `card-interactive`.

**Also:** remove the dashboard-page orbs; onboarding/empty/no-data cards lose glass per §10; the level
banner moves directly under the welcome banner so it isn't visually orphaned.

---

## 16. Profile Page Redesign

**Bug 1 — Achievements (real).** `flex flex-wrap` + `min-w-[220px] flex-1` → uneven last row / overflow.
Convert to a grid and wrap for safety:
```tsx
<TabsContent value="achievements">
  <div className="w-full overflow-hidden">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* achievement cards — card-base, NOT flex-wrap */}
    </div>
  </div>
</TabsContent>
```

**Bug 2 — Analytics chart height.** Container is `min-h-[300px]` and `PerformanceChart` is `h-64` inside it,
so it renders, but there's a pre-mount jump. Give the chart wrapper an explicit height so layout is stable
before Recharts mounts:
```tsx
<div className="relative w-full" style={{ height: 300 }}>
  <PerformanceChart data={stats.weeklyScores} />
</div>
```
Keep the dashed empty-state fallback.

**Bug 3 — Stats grid breakpoints.** `md:grid-cols-3 xl:grid-cols-5` → uneven 3+2 at md.
Use `grid-cols-2 sm:grid-cols-3 xl:grid-cols-5` so the layout flows naturally and the 5th card never strands.

**Structure decisions.** Profile stays: **header card → always-visible performance stats → tabs**
(History / Analytics / Achievements). The header already has `min-w-0` (good). The Mastery-XP panel on the
right is good — keep. Standardize content surfaces on `card-base`. Remove the backend leak in the error
state ("…running on port 5000") → a user-facing message + retry. Achievement cards gain **progress**
(Khan-style): each shows a mini progress bar toward its goal rather than a flat locked/unlocked icon.

---

## 17. Leaderboard Redesign

**Keep:** podium with trophy/medal icons, accessible search (label + describedby), current-user highlight
(`border-l-2 border-primary`), accuracy color thresholds, mobile horizontal-scroll podium, good empty &
skeleton states.

**Fixes:**
1. **Podium scale → height.** Replace rank-1 `md:scale-105` (clip/overlap risk in `md:grid-cols-3`) with
   explicit heights (rank 1 taller): `h-64` vs `h-52`. Unify podium cards on `card-base` (rank 1 keeps the
   warm accent border/fill).
2. **Perceptible hover.** `hover:bg-primary/[0.03]` → `hover:bg-primary/[0.06]` (still subtle, now visible).
3. **De-glass the table.** `overflow-hidden glass-card shadow-md` → `card-base overflow-hidden` (border, no shadow).
4. **Scroll affordance.** Wrap the `min-w-[600px]` table in a `scroll-fade` so the horizontal-scroll on
   mobile is discoverable.
5. **Non-color accuracy cue.** The accuracy cell already pairs a `TrendingUp` icon with the value — ensure
   the icon reflects the band (up/flat/down) so meaning isn't color-only (see §24).
6. **De-orb** the page background.

---

## 18. Quiz Experience Redesign

**Catalogue (`quiz/page.tsx`).** Cards → `card-interactive` (remove glass). Fix XP copy: cards show
`+{questionCount * 10} XP` but scoring is 50 base + up-to-50 bonus; show a truthful range like **"+50–100 XP"**
or label it "up to". De-orb the page.

**Play (`quiz/play/page.tsx`).** The playing state is already solid (progress bar, per-question topic +
difficulty chips, keyboard ←/→, timer, radiogroup). Additions:
- **Adaptive context label** above the options — `AdaptiveContextLabel` rendering `🎯 Targeting weak area: {topic}`
  using the already-available `currentQuestion.topic`. Makes the adaptive engine *legible* (the Perplexity lesson).
- **AI generation sequence** (signature moment). The loading state currently shows a pulsing `Cpu` + elapsed
  seconds. Upgrade to a staged, legible sequence (sub-steps fade in 200ms apart):
  *"Analyzing your performance · Selecting weak concepts · Building questions."* No logic change — purely the
  loading view while `state === "loading"`.
- Selected option: keep `ring-2 ring-primary`; ensure a filled radio metaphor reinforces selection.

**Review (`quiz/review/[id]/page.tsx`).** Explanation rendering **already exists** (`:277`). Decision:
restyle it to the system (`bg-muted/40 border border-border/40`, uppercase primary "Explanation" eyebrow,
relaxed body) rather than re-implement. Keep correct/incorrect option treatment but verify success/destructive
fills meet contrast in dark mode.

**Completion & celebration.** The adaptive completion view is informational. Add:
- **Score count-up** (0 → final, 300ms) on the accuracy figure.
- **`QuizCelebration`** confetti when `result.accuracy >= 80` (guarded by `prefers-reduced-motion`).
- Ensure the existing `LevelUpModal` / `level-up-toast` fire reliably on `levelChange > 0`.
- A **"suggested next"** affordance already partially exists ("Mix New Topics") — keep and label clearly.
- The completion "Concepts Covered" cells already show `correct/total` text alongside color — keep the text cue.

**Result page (`result/[id]`).** Add `sm:` fallbacks to `grid-cols-3` / `grid-cols-2` blocks; responsive
padding; `aria-label` on the color-coded score.

---

## 19. Settings Page (New)

The brief requires a **premium settings page**; no `settings` route exists today (there is a `pricing` page).
Create `app/(platform)/settings/page.tsx` as a **UI-only** surface that composes existing capabilities — it
must not add backend calls beyond what already exists.

**Sections (card-based, `card-base`, single-column on mobile → 2-col content on `lg`):**
1. **Profile** — reuse the existing display-name edit (the same `updateProfile(auth.currentUser, …)` flow
   already used on the profile page; no new logic). Avatar + name + member-since.
2. **Appearance** — theme selector (Light / Dark / System) wired to the existing `next-themes` provider.
3. **Account** — email (read-only, from `useAuth().user`), sign-out (existing `logout()`).
4. **About / Trust** — "Questions are generated by Google Gemini and verified for accuracy"; data-use line;
   version/links. These are static, trust-building (see brief's trust requirements).

Add a "Settings" entry to the sidebar nav (so the route is reachable) and an `aria-current` active state.
Every control reuses an existing handler — **no new endpoints, no schema changes.**

---

## 20. Loading, Empty & Error States

**Loading.** Skeletons must match content shape. Fix `StatsSkeleton` breakpoint mismatch
(`md:` → match the real `grid-cols-2 md:grid-cols-4`) and tile height. Quiz-catalogue skeleton should be
shape-matched (icon dot + title line + metadata pills) rather than blank rectangles. Chart skeleton keeps
`h-56 sm:h-64` to match the responsive chart. Add `role="status" aria-busy="true"` to loading wrappers
that persist (protected-route, dashboard, result).

**Empty.** Use the existing `EmptyState` component everywhere (icon + headline + description + action). Remove
glass from empty cards (dashboard onboarding → `bg-primary/5 border border-primary/20`; no-data → `card-base
border-dashed`). The profile-history empty state gains an icon + CTA. Streak-loss copy is **encouraging, not
punitive**: *"Your streak is resting — take a quiz today to restart it."*

**Error.** Standardize on `ErrorState` (icon + message + retry); wrap in `role="alert"`. Remove the
backend-port leak from the profile error. Login error block gets `role="alert"` + `aria-live="polite"`.

---

## 21. Mobile Design Decisions

Mobile-first: every layout is designed up from 320px, never scaled down from desktop.

1. **Header 4 → 3 controls** (drop avatar). Touch targets ≥ 44px; the streak/level chips are display-only.
2. **Drawer width** `w-[min(20rem,100vw-3rem)]` (was fixed `260px`) — safe on 320px.
3. **Dashboard stats** `grid-cols-2` on mobile (two clean rows of two), not a stranded 3+2.
4. **Daily-quiz widget** gets a real mobile rule — `grid-cols-1 xs:grid-cols-2` or reduced gap — so cards
   never shrink below readable width on <375px.
5. **Quiz play header** stacks category/difficulty/timer comfortably; the timer never relies on `scale-90`.
6. **Leaderboard** keeps the scroll podium + adds the right-edge `scroll-fade` on the table.
7. **Profile/Result grids** get `sm:` fallbacks; padding is responsive (`p-4 sm:p-6`), not a fixed large value.
8. **Modals/toasts** add `max-w-[calc(100vw-1.5rem)]` so celebration cards never exceed the viewport, and
   oversized celebration icons (`w-32`) scale down on mobile.

**No horizontal overflow anywhere.** Tables use an explicit `overflow-x-auto` wrapper with the fade; all
other content fits within the viewport at every tested width.

---

## 22. Desktop Design Decisions

1. **Tablet/`md` is a first-class layout** (768–1023px), not "mobile stretched." The dashboard splits to
   two columns at `md`, stats show four across, profile stats use three.
2. **Sidebar** collapses to icons for power users; active state is unambiguous in both modes.
3. **Whitespace widens** between sections at `lg`+ (`space-y-8`), per the Linear lesson.
4. **Max content width** stays governed by `Container` (`max-w-80rem`); the flex parent shouldn't let
   content run edge-to-edge on ultra-wide displays.
5. **Type contrast** is most dramatic on large screens (display vs body), reinforcing premium feel.
6. **Hover affordances** (border-color, perceptible row hover) are tuned for pointer devices without
   becoming the only signal of interactivity.

---

## 23. Responsiveness Decisions

**Tested widths:** 320 · 375 · 425 · 768 · 1024 · 1280 · 1440.

**Global fix:** add the `md` step to `globals.css` utilities; stop grids from jumping across `md`.

| Surface | Mobile (≤640) | Tablet (md, 768–1023) | Desktop (lg+, ≥1024) |
|---|---|---|---|
| Dashboard main | 1 col | `md:` 55/45 split | 55/45 split, wider gaps |
| Dashboard stats | `grid-cols-2` | `md:grid-cols-4` | 4 across |
| Dashboard Zone 4 | 1 col | `md:grid-cols-2` | `lg:` 40/60 |
| Profile stats | `grid-cols-2` | `sm:grid-cols-3` | `xl:grid-cols-5` |
| Profile analytics | 1 col, chart h=300 | 1 col | `lg:grid-cols-3` (2/1) |
| Leaderboard podium | scroll (snap) | 3-col, height diff | 3-col (2-1-3) |
| Quiz play | 1 col, stacked header | centered `max-w-xl` | centered `max-w-xl` |
| Landing grids | 1 col | `sm:`2 / `md:`3 | 3 col |

**Invariants:** no horizontal overflow; no clipped content; no overlapping cards; no collapsing charts; no
broken tabs; no fixed-width layouts that exceed the viewport.

---

## 24. Accessibility Decisions (WCAG 2.1 AA)

**Already good (keep):** consistent `focus-visible:ring` across primitives; `aria-invalid` error states;
accessible search label; `role="radiogroup"` on quiz options; skip-to-content link; base-ui primitives
provide dialog focus-trap and labelling.

**To fix (from audit):**
- **A11Y-01 — color-only status.** Leaderboard accuracy, completion concept cells, and any
  success/warning/destructive text must pair color with an icon or label (e.g. `TrendingUp/Minus/TrendingDown`).
- **A11Y-02 — theme toggle.** The hidden icon should be `aria-hidden`; the SSR placeholder button needs an
  `aria-label` so a transient unlabeled control isn't exposed.
- **A11Y-03 — login labels.** Raise `text-[11px]` labels to `text-xs/sm`; add `role="alert"` +
  `aria-live="polite"` to the error region; keep `htmlFor`/`id` pairing.
- **A11Y-04 — loading semantics.** Persistent loaders get `role="status" aria-busy="true"`.
- **A11Y-05 — recent-activity & podium.** Letter-avatars get `aria-label`; the activity list becomes
  semantic `<ul>/<li>`; decorative dots/particles get `aria-hidden`.
- **A11Y-06 — header artifact.** If `header.tsx` ships, its dropdown trigger needs `aria-haspopup`/
  `aria-expanded`; the notification pulse must reflect real state or be removed.
- **A11Y-07 — chart.** Add an `aria-label`/visually-hidden summary so the trend isn't purely visual.
- **A11Y-08 — touch targets.** All interactive controls ≥ 44px on mobile.
- **A11Y-09 — reduced motion.** Gate entrance/celebration animations behind `prefers-reduced-motion`.

**Targets:** text contrast ≥ 4.5:1 (verify amber/success on tinted cards in dark mode); full keyboard
operability (sidebar, tabs, dialogs, quiz nav already keyboard-driven — extend coverage and visible focus).

---

## 25. Before vs After

**Philosophy.**
> **Before:** Show everything at once. Glass on all surfaces. Gradient orbs everywhere. A card for
> everything. No visual hierarchy. Gamification hidden on two pages.
>
> **After:** One clear action per page. Glass marks floating elements only. One quiet page texture. Space
> creates hierarchy. Streak/level visible everywhere. Every empty state teaches. Every loader has shape.

| Dimension | Before | After |
|---|---|---|
| Dashboard | 8 equal-weight widgets, `lg`-only split (breaks on laptops) | 3 zones (Now/Trend/Actions), `md` split, dominant CTA |
| Surfaces | `glass-card` on stats, panels, tables, features | `glass` only on chrome/overlays/active quiz card; content = `card-base` |
| Background | ~9 gradient orbs across pages | ≤1 subtle texture per page |
| Type | Mostly Inter; Manrope sporadic | Manrope on every H1/H2; tabular numerics; dramatic contrast |
| Gamification | Dashboard/profile only | Sidebar + mobile header on every page |
| Copy | "Staff Engineer", "Rust and Go", `CTA`, "2,000+ developers", port-5000 leak | Student-facing, truthful, trust-building |
| Completion | Static results card | Count-up score + XP float + confetti + reliable level-up |
| Breakpoints | `1→3`/`1→2` jumps skipping `md` | Mobile→tablet→desktop, no skipped steps |
| Settings | none | dedicated UI-only settings page |

---

## 26. Implementation Roadmap (8 Phases)

Execute in order. Read each file before editing. Make only the changes for the active phase. Run
`npm run build` (and `npm run lint`/`type-check`) after each phase. Commit per phase with a descriptive
message. Never modify `server/`, `lib/firebase.ts`, `lib/api-client.ts`, `hooks/use-*quiz*.ts` logic, or any
backend file — UI/UX only.

**Phase 1 — Critical bugs (user-visible).**
Profile achievements `flex-wrap → grid` (+ `overflow-hidden` wrapper); profile analytics explicit chart
height; profile stats `grid-cols-2 sm:grid-cols-3 xl:grid-cols-5`; dashboard main grid `lg:` → `md:`;
`StatsSkeleton` breakpoint/height match; landing copy fixes (features + how-it-works); `cta-section` `CTA`
→ "Start free today" + reassurance; reconcile fabricated stats; calm hero-preview decorative animation;
remove backend-port leak in profile error.

**Phase 2 — Design-system cleanup (glass + tokens).**
Add `card-base`/`card-interactive`/`stat-number`/`scroll-fade` utilities and the `md` media step; delete
`globals_backup.css`; resolve `header.tsx`; replace `glass-card` on content (stats, dashboard panels,
daily-quiz cards, leaderboard table + podium, landing feature/step cards, footer, empty/no-data) with
`card-base`/`card-interactive`; remove per-section orbs (≤1 texture/page); finish `tabular-nums`/`font-heading` coverage.

**Phase 3 — Navigation.**
`StreakBadge` + `XpMiniBar` in the sidebar (read the existing dashboard query cache, read-only); collapsed
active-state left border + `aria-current`; mobile header 4→3 controls with streak/level chips; drawer width
`w-[min(20rem,100vw-3rem)]`; add **Settings** nav entry.

**Phase 4 — Dashboard.**
Zone layout (Now/Trend/Actions); 4-card stats with streak-accent dominant metric; `md` two-column split;
remove inner `sm:` sub-grid cramping; de-orb; de-glass per Phase 2.

**Phase 5 — Profile.**
Confirm Phase-1 bug fixes; standardize on `card-base`; achievement progress bars; tab content wrapped
`overflow-hidden`; analytics 2/1 split at `lg`.

**Phase 6 — Quiz experience.**
`AdaptiveContextLabel`; staged AI generation sequence; restyle (don't re-add) review explanations; score
count-up + `QuizCelebration` confetti (reduced-motion guarded); reliable level-up; truthful catalogue XP copy.

**Phase 7 — Mobile.**
Per §21: spacing, overflow, touch targets, stacking order, drawer, modal/toast max-width, leaderboard
scroll-fade. Test 320/375/425/768/1024/1280/1440.

**Phase 8 — Final polish + Settings + validation.**
Manrope on all H1/H2; finish tabular numerics; progress-bar mount animation everywhere; tasteful
microinteractions/hover; build the **Settings** page; run the full validation checklist (§27).

---

## 27. Validation Checklist

Run after each phase; all must pass before "complete."

**Functional / safety**
- [ ] No backend, Firebase, Gemini, API, or auth logic changed.
- [ ] No quiz-generation or scoring logic changed.
- [ ] `npm run build` passes; `npm run lint` and `tsc --noEmit` clean.
- [ ] No functionality regressions (login, quiz start/play/submit, review, leaderboard, profile edit, theme).

**Layout / responsiveness** (320·375·425·768·1024·1280·1440)
- [ ] No horizontal overflow on any page.
- [ ] No overlapping cards or clipped content.
- [ ] No collapsing/zero-height charts.
- [ ] No broken or overlapping tab panels.
- [ ] No fixed-width layout exceeding the viewport.
- [ ] Dashboard, profile, leaderboard verified at the `md` (tablet) range specifically.

**Design system**
- [ ] Glass appears only on chrome/overlays/active-quiz-card; content uses `card-base`/`card-interactive`.
- [ ] ≤1 background texture per page; no per-section orb stacks.
- [ ] Manrope on every H1/H2; scores/XP/ranks/timers use `tabular-nums`.
- [ ] Consistent spacing (section gaps 24–32px), radius, and border-only content elevation.
- [ ] No developer-template copy; no fabricated/conflicting stats; no backend leaks.

**Accessibility (WCAG 2.1 AA)**
- [ ] All status has a non-color cue; contrast ≥ 4.5:1 (incl. dark-mode tinted surfaces).
- [ ] Keyboard reachable/operable; visible focus on all interactive elements; touch targets ≥ 44px.
- [ ] Loading regions `role="status" aria-busy`; errors `role="alert"`; decorative elements `aria-hidden`.
- [ ] Reduced-motion respected.

**Performance**
- [ ] No continuous animation of `box-shadow`/`filter`; transforms/opacity used for motion.
- [ ] No layout shift from hover (no `translateY` on content cards).
- [ ] Lighthouse-friendly (no obvious CLS/oversized-asset regressions).

---

## 28. Agent Execution Rules

1. **This document is the single source of truth.** Where it corrects v1.0 (the Reality Checks in §1),
   follow v2.0 — do not re-introduce already-fixed "bugs."
2. **Read before editing.** Open each target file and confirm current state; the code may already match the
   goal (verify, then skip).
3. **One phase at a time, in order.** Make only that phase's changes. Build + lint + type-check after each.
4. **Never touch business logic / backend.** No `server/`, `lib/firebase.ts`, `lib/api-client.ts`, quiz
   hooks' logic, schema, or auth flow. New UI reuses existing handlers and query caches only.
5. **Subtractive bias.** Prefer removing glass/orbs and unifying classes over adding new visual weight.
6. **Report per phase:** files changed · why · UX improvement · remaining issues · screens needing review.
7. **Accessibility and responsiveness are acceptance criteria, not polish** — they gate completion.

---

*End of UIUXQuiz.md (v2.0 — code-verified).*
*Prepared for Antigravity Agent implementation. Estimated effort: 12–16 developer-days.*
