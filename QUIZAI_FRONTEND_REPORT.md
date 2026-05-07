# QuizAI — Frontend SaaS-Level Upgrade Report
**Repository:** https://github.com/AKabhishek9/quizAI  
**Audit Date:** May 2, 2026  
**Focus:** UI/UX, Responsiveness, Visual Design, Alignment, SaaS Quality  

---

## Executive Summary

The QuizAI frontend is built on a solid technical foundation — Next.js 15, Tailwind 4, Framer Motion, shadcn/ui, Recharts. The code is clean and well-structured. However, there is a **clear design identity crisis** running through the entire application:

- The **landing page** uses hardcoded `neutral-*` and `indigo-*` colours (bypassing the design token system)
- The **platform pages** use the proper `bg-card`, `border-border`, `text-foreground` token system
- The **quiz components** mix both systems inconsistently
- Button styles are inconsistent across pages — sometimes `bg-indigo-600`, sometimes `bg-primary`, sometimes inline styles

This split means the light/dark mode doesn't work consistently, the visual language feels incoherent, and the app doesn't look like one product.

**The core upgrade path:** Unify the design system → fix responsiveness gaps → add missing SaaS-level UI patterns → polish micro-interactions.

---

## Table of Contents

1. [Design System Issues](#1-design-system-issues)
2. [Landing Page Improvements](#2-landing-page-improvements)
3. [Login Page Issues](#3-login-page-issues)
4. [Dashboard Issues](#4-dashboard-issues)
5. [Quiz Flow Issues](#5-quiz-flow-issues)
6. [Leaderboard Issues](#6-leaderboard-issues)
7. [Profile Page Issues](#7-profile-page-issues)
8. [Navigation & Layout Issues](#8-navigation--layout-issues)
9. [Responsiveness Gaps](#9-responsiveness-gaps)
10. [Missing SaaS Patterns](#10-missing-saas-patterns)
11. [Micro-interactions & Animation](#11-micro-interactions--animation)
12. [Accessibility Issues](#12-accessibility-issues)
13. [Priority Execution Plan](#13-priority-execution-plan)

---

## 1. Design System Issues

### DS-01 · Hardcoded colours everywhere instead of CSS variables
**Severity:** Critical — breaks dark mode, breaks theming  
**Affected files:** Every landing component, quiz-option.tsx, quiz-idle-state.tsx, quiz-completed-state.tsx, navbar.tsx, footer.tsx

The landing page and quiz components use `neutral-*`, `indigo-*`, `green-*`, `red-*` hardcoded Tailwind classes instead of the design token system (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.).

**Examples found:**
```tsx
// hero.tsx — hardcoded, bypasses dark mode:
className="bg-white dark:bg-neutral-900"
className="text-neutral-900 dark:text-neutral-100"

// quiz-option.tsx — hardcoded:
"border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
"border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"

// quiz-idle-state.tsx — hardcoded:
"bg-indigo-600 text-white hover:bg-indigo-700"
"border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
```

**Fix — replace all hardcoded colours with tokens:**
```tsx
// BEFORE:
"bg-white dark:bg-neutral-800"
// AFTER:
"bg-card"

// BEFORE:
"border-neutral-200 dark:border-neutral-700"
// AFTER:
"border-border"

// BEFORE:
"text-neutral-600 dark:text-neutral-400"
// AFTER:
"text-muted-foreground"

// BEFORE:
"bg-indigo-600 text-white hover:bg-indigo-700"
// AFTER:
"bg-primary text-primary-foreground hover:bg-primary/90"
```

---

### DS-02 · Two different button systems used across the app
**Severity:** High  

Some pages use the `<Button>` component from shadcn, others use raw `<button>` elements with inline Tailwind. Some use `bg-primary`, others hardcode `bg-indigo-600`. 

**Audit findings:**
- `hero.tsx` → `bg-indigo-600` raw button
- `cta-section.tsx` → raw `<button>` with `bg-indigo-600`
- `quiz-idle-state.tsx` → `bg-indigo-600` in `<Button>` component
- `dashboard/welcome-banner.tsx` → `bg-primary` in `<Link>` (correct)
- `play/page.tsx` → `bg-foreground text-background` (different again)

**Fix:** Use `<Button>` component everywhere. Delete all raw `<button>` tags in page-level components and replace them.

---

### DS-03 · Font system unused in components
**Severity:** Medium  

`app/layout.tsx` loads **Inter** (`--font-sans`) and **Manrope** (`--font-heading`). The heading font is only used in `navbar.tsx` (`font-heading`) and the level-up modal. Every other heading across the entire app uses the default sans-serif. This makes the typography feel generic. The heading font should be applied to all `<h1>` and `<h2>` tags across every page.

---

### DS-04 · Sonner toasts not configured globally
**Severity:** Low  

Sonner is installed but `<Toaster />` component is not added to `app/layout.tsx`. Toast notifications from `toast.success()` in `daily/[id]/page.tsx` will silently fail to render. Add to `layout.tsx`:
```tsx
import { Toaster } from "sonner";
// Inside body:
<Toaster richColors position="bottom-right" />
```

---

## 2. Landing Page Improvements

### LAND-01 · [COMPLETED] Hero section is too minimal — no product preview
**Severity:** High  

The hero has a headline, subtitle, and two buttons — but no visual representation of the actual product. Every SaaS landing page at this level (Linear, Vercel, Notion, Raycast) shows a screenshot, mockup, or animated preview of the product UI below the fold. Without it, users have no idea what they're signing up for.

**Fix:** Add a dashboard screenshot or an animated UI mockup below the CTA buttons. Even a simplified browser-frame card showing the quiz player would dramatically increase conversion.

---

### LAND-02 · [COMPLETED] Hero copy uses technical jargon instead of benefits
**Severity:** High  

```
"Adaptive assessment telemetry that identifies conceptual gaps. Synchronize your knowledge graph, neutralize weak points..."
```

This reads like an engineering spec, not a product for students. Real users (students, exam aspirants) will not understand "telemetry," "knowledge graph," or "synchronize" in this context. Compare with competitors:

- Duolingo: *"The free, fun, and effective way to learn a language"*
- Khan Academy: *"You can learn anything. Build a life you love"*

**Fix:** Rewrite the copy for clarity:
```tsx
// Headline:
"Master Any Subject with AI-Generated Quizzes"

// Subtitle:
"Get personalized quiz questions on any topic, instantly. 
Track your weak spots, level up daily, and never run out of practice material."
```

---

### LAND-03 · Social proof logos are broken Google-hosted images
**Severity:** High  

The hero uses hardcoded `lh3.googleusercontent.com/aida-public/AB6AXu...` URLs for GitHub, Vercel, Stripe, and Linear logos. These are AI-generated placeholder image URLs that will break. Also, showing GitHub/Vercel/Stripe logos implies QuizAI is used by these companies — which is misleading.

**Fix:** Replace with actual stats or user testimonials:
```tsx
// Replace fake logos with real stats:
<div className="flex gap-8">
  <div className="text-center">
    <p className="text-2xl font-bold">2,000+</p>
    <p className="text-sm text-muted-foreground">Active learners</p>
  </div>
  <div className="text-center">
    <p className="text-2xl font-bold">50k+</p>
    <p className="text-sm text-muted-foreground">Questions generated</p>
  </div>
  <div className="text-center">
    <p className="text-2xl font-bold">4</p>
    <p className="text-sm text-muted-foreground">Daily quiz categories</p>
  </div>
</div>
```

---

### LAND-04 · [COMPLETED] CTA buttons lead to wrong pages
**Severity:** Medium  

- "Initiate Discovery" → goes to `/login` ✓ (correct)
- "Explore Repository" → goes to `/quiz` which requires authentication, so unauthenticated users get redirected to `/login` anyway — confusing

**Fix:** Change "Explore Repository" to link to `/login?tab=signup` with a pre-selected signup tab, or to a `/#features` anchor scroll.

---

### LAND-05 · Features section has no visual hierarchy between cards
**Severity:** Medium  

All 6 feature cards are identical weight, identical size, identical layout. SaaS products differentiate features by making one card larger (a "hero feature"), adding screenshots, or using a bento-grid layout.

**Fix:** Use a bento grid layout where the first feature card spans 2 columns with a larger visual, or add subtle icons that are more distinctive per feature.

---

### LAND-06 · Missing pricing section
**Severity:** Medium  

The navbar links to `/pricing` but no pricing page exists — clicking it does nothing. Either build a pricing page (Free / Pro tiers) or remove the link from the navbar.

---

### LAND-07 · Missing features page
**Severity:** Low  

Navbar also links to `/features` which doesn't exist.

---

## 3. Login Page Issues

### LOGIN-01 · "Monolith" terminology is confusing and off-brand
**Severity:** Medium  

```tsx
// Login page has these strings:
"Enter your credentials to access the monolith"
"Join the monolith today"
```

A monolith is a software architecture term. Students signing up for a quiz app will find this confusing or off-putting. This appears to be leftover copy from a different product idea.

**Fix:**
```tsx
"Sign in to start learning"
"Create your free account"
```

---

### LOGIN-02 · "Forgot password" button does nothing
**Severity:** High  

The login form has a "Forgot?" button with `type="button"` and no `onClick` handler. Clicking it does nothing. This will cause user frustration.

**Fix:** Implement Firebase password reset:
```tsx
import { sendPasswordResetEmail } from "firebase/auth";

const handleForgotPassword = async () => {
  if (!email) {
    setError("Enter your email address first");
    return;
  }
  await sendPasswordResetEmail(auth as Auth, email);
  setError(null);
  // Show success message
};
```

---

### LOGIN-03 · Login page background doesn't use design tokens
**Severity:** Low  

```tsx
className="min-h-screen ... bg-[oklch(0.97_0.005_264)] dark:bg-background"
```

The light mode background is a hardcoded `oklch()` value that doesn't match the card-based design system. Use `bg-background` for both modes.

---

### LOGIN-04 · Name field collected but never sent to backend
**Severity:** Medium  

The signup form collects `name` in state but `createUserWithEmailAndPassword` doesn't include it in the Firebase call. The backend gets the name from the Firebase token's `displayName` — which is empty for email/password signups. Users who sign up with email will be shown as "Student" everywhere.

**Fix:** After creating the user, update the display name:
```tsx
import { updateProfile } from "firebase/auth";
const result = await createUserWithEmailAndPassword(safeAuth, email, password);
if (name) await updateProfile(result.user, { displayName: name });
```

---

## 4. Dashboard Issues

### DASH-01 · Welcome banner has no visual interest — just text and a button
**Severity:** Medium  

The welcome banner is just:
```tsx
<h1>Good morning, Abhishek 👋</h1>
<Link href="/quiz">Start Quiz →</Link>
```

Compare with Linear, Notion, or Vercel dashboards — they show contextual information: streak status, today's challenge, XP progress, or a motivational stat. The greeting area is wasted space.

**Fix:** Add a streak indicator and today's XP progress inline with the greeting:
```tsx
<div className="flex items-start justify-between">
  <div>
    <h1>Good morning, Abhishek 👋</h1>
    <p className="text-sm text-muted-foreground mt-1">
      🔥 {stats.currentStreak} day streak · {profile.xp} XP earned
    </p>
  </div>
  <Link href="/quiz">Start Quiz →</Link>
</div>
```

---

### DASH-02 · "Database data" badge on Performance Trend chart is unexplained
**Severity:** Low  

The chart header shows a grey badge reading "Database data" which makes no sense to end users. It appears to be a developer debugging label left in production.

**Fix:** Remove it, or replace with "Last 10 sessions".

---

### DASH-03 · Daily Quests widget links use wrong ID format
**Severity:** High  

```tsx
<Link href={`/quiz/daily/${quiz.id}`}>
```

`quiz.id` comes from the API response field `id`, which is set to:
```ts
id: `${a.subject}-${a.stream}`.toLowerCase().replace(/\s+/g, '-')
```

But the daily quiz route `/quiz/daily/[id]` expects a **category key** like `general_knowledge`, `tech`, `maths`, `aptitude` — not a subject-stream compound ID. The links will navigate to "Quest not found" for all 4 categories.

**Fix:** Use `quiz.type` (which is the category key) instead of `quiz.id`:
```tsx
<Link href={`/quiz/daily/${quiz.type}`}>
```

---

### DASH-04 · Dashboard grid breaks at medium screen sizes (768px–1280px)
**Severity:** High — affects the most common laptop screen size  

The dashboard uses:
```tsx
className="grid grid-cols-1 xl:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]"
```

There is NO `md:` or `lg:` breakpoint between `grid-cols-1` (mobile) and `xl:grid-cols-[...]` (1280px+). On a typical 13" laptop (1280px or less), users see a single column layout where all widgets stack vertically — taking up enormous vertical scroll space. The intended two-column layout only kicks in at 1280px.

**Fix:**
```tsx
className="grid grid-cols-1 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]"
// lg = 1024px, which covers most laptops
```

---

### DASH-05 · Stats cards lack colour differentiation
**Severity:** Low  

All 3 stats cards (Quizzes Completed, Average Score, Ranking) use identical styling. SaaS dashboards differentiate stats by icon colour, a coloured left border, or a subtle background tint matching the metric type.

**Fix:** Give each card a semantic colour:
- Quizzes Completed → blue tint
- Average Score → green/amber based on value
- Ranking → gold/purple tint

---

### DASH-06 · SkillEquilibrium category breakdown has no fallback when data is empty
**Severity:** Medium  

When `stats.categoryPerformance` is empty (new user, no quizzes taken), the component renders nothing. The right half of the dashboard bottom row is completely blank — just whitespace.

**Fix:** Add an empty state:
```tsx
if (!stats.categoryPerformance.length) {
  return (
    <EmptyState 
      icon={BarChart3}
      title="No data yet"
      description="Complete a quiz to see your category breakdown"
    />
  );
}
```

---

## 5. Quiz Flow Issues

### QUIZ-01 · Quiz page (`/quiz`) shows no quiz count or descriptions
**Severity:** Medium  

The quiz catalogue page shows 4 daily quiz cards. Each card only shows the category name and question count. There's no description, no difficulty indicator, no "completed today" state, no XP reward shown. Compare with Duolingo's lesson cards or Coursera's course cards — they show rich metadata.

**Fix:** Add to each card:
- XP reward (+50 XP)
- Difficulty indicator (Medium)
- Completion state (green checkmark if done today)
- Estimated time (5 min)

---

### QUIZ-02 · Topic selection page suggestions are hardcoded and limited
**Severity:** Medium  

`SUGGESTIONS` in `topic/page.tsx` is hardcoded with 5–10 items per stream. If a user selects "Commerce & Finance" they see only 4 suggestions. The page should fetch available topics from the backend (`/api/quiz/all`) and show dynamically populated suggestions based on what's actually in the database.

---

### QUIZ-03 · Quiz player has no progress indicator during adaptive quiz
**Severity:** Medium  

The adaptive quiz player (`play/page.tsx`) shows `1 / 10` but has NO timer. Daily quizzes have a timer, adaptive quizzes don't. This is inconsistent. Many users expect time pressure even in practice mode, and the absence of any timer makes the quiz feel unstructured.

**Fix:** Add an optional timer to the adaptive quiz player using the existing `useTimer` hook. Make it visible but non-blocking (doesn't auto-submit).

---

### QUIZ-04 · Quiz playing state `isRevealed` is always `false` in adaptive mode
**Severity:** High  

In `play/page.tsx`, `<QuizOption>` is rendered with:
```tsx
isRevealed={false}
correctOptionId={""}
```

This means the quiz option component NEVER shows correct/wrong feedback in adaptive mode — even after the backend grades the answers. Users select an option and get NO feedback until they complete the entire quiz. This is a major UX gap compared to daily quizzes where immediate per-question feedback is shown.

**Fix:** Since adaptive quizzes are server-graded, show feedback only on the results page — but make it clear to users why feedback isn't shown inline:
```tsx
// Current "Graded at end" hint exists but is tiny — make it more prominent
<div className="bg-muted/30 rounded-lg p-3 text-center text-xs text-muted-foreground mb-4">
  💡 This quiz is graded at the end. Select your best answer and continue.
</div>
```

---

### QUIZ-05 · Quiz completed state for adaptive quiz shows no concept breakdown visual
**Severity:** Medium  

The adaptive quiz result shows `concept.correct/concept.total` as text pairs in a scrollable list. These should be rendered as mini progress bars for instant visual comprehension — especially for users who answered 3+ different concept areas.

---

### QUIZ-06 · Daily quiz "Quest not found" page has no retry button
**Severity:** Low  

When a daily quiz fails to load (expired, not found), the user sees:
```
Quest not found
This daily quest has expired or doesn't exist.
[Back to library]
```

There's no "Try again" button or explanation that new quizzes generate at midnight. Add a countdown to midnight and a retry button.

---

### QUIZ-07 · Stream selection page doesn't include "General" stream used by daily quizzes
**Severity:** Medium  

The stream selection page (`stream/page.tsx`) has 4 streams: Tech & Software, Pure Sciences, Commerce & Finance, Humanities & General. But the daily quiz service uses `stream: "General"` for Maths and Aptitude categories. Users who select "Humanities & General" and try to practice Maths topics will get no DB results because the stream name doesn't match.

---

## 6. Leaderboard Issues

### LEAD-01 · Podium layout breaks on mobile — shows all 3 in a column without visual hierarchy
**Severity:** High  

The mobile podium uses:
```tsx
<div className="block md:hidden space-y-4">
  <PodiumItem user={topThree[0]} position={1} />
  <PodiumItem user={topThree[1]} position={2} />
  <PodiumItem user={topThree[2]} position={3} />
</div>
```

Three identical-looking cards stacked vertically on mobile — there's no size or visual difference to indicate rank 1 vs rank 3. The `md:scale-105` treatment only applies on desktop.

**Fix:** On mobile, show a horizontal scrollable podium with size differences, or use a compact ranked list format.

---

### LEAD-02 · Accuracy column always shows `text-success` colour regardless of value
**Severity:** Medium  

```tsx
<div className="flex items-center justify-end gap-1.5 text-success font-bold text-sm">
  <TrendingUp className="h-3.5 w-3.5" />
  {user.avgAccuracy}%
</div>
```

Every accuracy value is green with a TrendingUp icon, even if the user has 20% accuracy. The colour should reflect the actual score:
```tsx
className={cn(
  user.avgAccuracy >= 70 ? "text-success" : 
  user.avgAccuracy >= 50 ? "text-warning" : "text-destructive"
)}
```

---

### LEAD-03 · No "you are here" indicator — users can't find their own rank
**Severity:** Medium  

The leaderboard shows 20 users but doesn't highlight the current user's row. Every competitive platform (Duolingo, Chess.com) highlights the logged-in user's row. This is a key feature that drives motivation.

**Fix:** Compare `user.userId` with the authenticated user's UID and apply a highlight class.

---

### LEAD-04 · Search filters but doesn't show "no results" state
**Severity:** Low  

If no users match the search term, the table body is empty with no message. Add a no-results state:
```tsx
{filteredUsers.length === 0 && (
  <tr>
    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
      No users found matching "{searchTerm}"
    </td>
  </tr>
)}
```

---

## 7. Profile Page Issues

### PROF-01 · `profile.memberSince` is always undefined — shows "Joined undefined"
**Severity:** High  

```tsx
<span>Joined {profile?.memberSince}</span>
```

`memberSince` is not returned by the backend `getUserDashboard()` endpoint. The `UserProfile` interface includes it but the backend never sets it. Result: "Joined undefined" is shown on every profile page.

**Fix option A:** Add `memberSince` to the backend response using the user's `createdAt` MongoDB timestamp.  
**Fix option B:** Remove the field until implemented:
```tsx
{profile?.memberSince && (
  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <Calendar className="h-3 w-3" />
    Joined {profile.memberSince}
  </span>
)}
```

---

### PROF-02 · "Edit Profile" button does nothing
**Severity:** Medium  

```tsx
<button type="button" className="...">
  <Pencil className="h-3 w-3" />
  Edit Profile
</button>
```

No `onClick` handler. This is a dead button that creates user frustration when clicked.

**Fix:** Either implement a name-change dialog using shadcn `<Dialog>` and Firebase `updateProfile`, or hide the button until the feature is ready.

---

### PROF-03 · Profile page has a raw debug string `text-neutral-400` shown to users
**Severity:** High  

```tsx
<div className="flex items-center justify-between mt-1.5">
  <span className="text-[10px] text-muted-foreground">text-neutral-400</span>
  <span className="text-[10px] text-muted-foreground">text-neutral-400</span>
</div>
```

These are literal strings "text-neutral-400" displayed below the XP progress bar in the Mastery XP card. This is a development placeholder that was never replaced. Replace with:
```tsx
<span className="text-[10px] text-muted-foreground">Level {profile.level}</span>
<span className="text-[10px] text-muted-foreground">Level {profile.level + 1}</span>
```

---

### PROF-04 · Quiz history table shows "Time Taken" column but data is never provided
**Severity:** Medium  

```tsx
<span className="text-sm text-muted-foreground tabular-nums">
  {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
</span>
```

`attempt.timeTaken` is not part of the `QuizAttempt` type or backend response. It will always be `NaN` seconds → "NaN m NaNs". The backend doesn't track quiz duration anywhere.

**Fix:** Remove the "Time Taken" column until duration tracking is implemented. Replace with "Topics" column showing `attempt.topics.join(", ")`.

---

### PROF-05 · Achievements tab says "coming soon" but wastes space
**Severity:** Low  

A full tab with a large empty state taking up half the screen real estate. Replace with locked achievement badges to show what users will unlock — this creates aspiration rather than disappointment:

```tsx
const ACHIEVEMENTS = [
  { id: "first_quiz", name: "First Steps", icon: "🎯", desc: "Complete your first quiz", locked: true },
  { id: "streak_7", name: "Week Warrior", icon: "🔥", desc: "7-day streak", locked: true },
  // ...
];
```

---

### PROF-06 · Stats section heading says "Detailed Stats Grid" — a developer label
**Severity:** Medium  

```tsx
<h2 className="text-base font-bold text-foreground">Detailed Stats Grid</h2>
```

"Detailed Stats Grid" is a code comment that was accidentally used as a heading. Replace with:
```tsx
<h2>Your Performance</h2>
```

---

## 8. Navigation & Layout Issues

### NAV-01 · Sidebar collapse state is lost on page navigation
**Severity:** Medium  

The sidebar collapse state is managed with `useState` which resets on every Next.js page navigation. If a user collapses the sidebar and navigates to a new page, it expands again. Persist using `localStorage`:

```tsx
const [collapsed, setCollapsed] = useState(() => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sidebar-collapsed") === "true";
});

const toggle = () => {
  setCollapsed(prev => {
    localStorage.setItem("sidebar-collapsed", String(!prev));
    return !prev;
  });
};
```

---

### NAV-02 · Mobile top bar missing notification/profile quick access
**Severity:** Low  

The mobile top bar only shows the logo, theme toggle, and hamburger menu. SaaS platforms show a user avatar in the top bar as a quick profile access point. Add an avatar that links to `/profile`.

---

### NAV-03 · Sidebar has no active indicator animation
**Severity:** Low  

The active sidebar link uses `bg-primary/10 text-primary` — a static background. Compare with Linear or Vercel sidebars which animate a sliding indicator. Add a subtle left-border indicator:
```tsx
className={cn(
  "...",
  isActive && "border-l-2 border-primary pl-[9px]"  // 1px compensation for border
)}
```

---

### NAV-04 · Platform layout `ml-0 lg:ml-[220px]` creates layout shift when sidebar collapses
**Severity:** Medium  

The main content area uses `lg:ml-[220px]` which is hardcoded to the expanded sidebar width. When the sidebar collapses to 56px, the content area doesn't reflow — the sidebar overlaps content or a gap appears.

**Fix:** Pass the collapsed state via context and use it in the layout:
```tsx
// In sidebar, export a context:
export const SidebarContext = createContext({ collapsed: false });

// In platform layout:
const { collapsed } = useSidebar();
<div className={cn("flex-1", collapsed ? "lg:ml-[56px]" : "lg:ml-[220px]")}>
```

---

## 9. Responsiveness Gaps

### RESP-01 · Dashboard bottom row breaks on tablet (768px–1024px)
**Severity:** High  

```tsx
className="grid grid-cols-1 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]"
```

Between mobile and `lg:` (1024px), the Daily Quests widget and Category Breakdown stack vertically. On a tablet (768px–1023px) this creates excessive vertical scroll. Add `md:` breakpoints:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]"
```

---

### RESP-02 · Topic selection page card is not padded correctly on very small screens (<375px)
**Severity:** Low  

`p-6 sm:p-8` on the topic card — at 320px (iPhone SE) the inner content overflows. The input field and badge chips will wrap incorrectly.

---

### RESP-03 · Leaderboard table has no horizontal scroll on mobile
**Severity:** High  

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <th>Rank</th><th>Player</th><th>Level</th><th>Score</th><th>Accuracy</th>
```

5 columns with no minimum column widths means the table text wraps and columns collapse on mobile. The table is wrapped in `overflow-x-auto` but the inner table has no `min-w-[600px]` to trigger the scroll.

**Fix:**
```tsx
<table className="w-full min-w-[560px]">
```

---

### RESP-04 · Stream selection page 2-column grid shows too cramped on tablets
**Severity:** Low  

`grid-cols-1 md:grid-cols-2` — on iPad (768px), two cards side by side with internal content (large icon, title, description) makes each card very narrow. The description text wraps aggressively.

---

### RESP-05 · Quiz completed state cards are full-width on desktop — looks wrong
**Severity:** Low  

The completion result card (`max-w-2xl mx-auto`) on a widescreen monitor is too narrow and sits in the center with lots of blank space on both sides. The `max-w-2xl` (672px) cap is appropriate for mobile but on desktop the card could expand to use the available space more effectively.

---

## 10. Missing SaaS Patterns

### SAAS-01 · No onboarding flow for new users
**Severity:** High  

When a new user signs up and reaches the dashboard, they see stats cards with zeros, an empty activity feed, and a "Daily Quests being generated" message. There's no guidance on what to do first.

**Fix:** Detect first-time users (`stats.totalQuizzes === 0`) and show an onboarding banner:
```tsx
{stats.totalQuizzes === 0 && (
  <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
    <h3 className="font-semibold mb-2">Welcome to QuizAI! 🎉</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Take your first quiz to see your personalized dashboard come alive.
    </p>
    <Link href="/quiz/stream">
      <Button>Take Your First Quiz →</Button>
    </Link>
  </div>
)}
```

---

### SAAS-02 · No toast feedback for successful actions
**Severity:** High  

Most user actions (quiz submission, daily quiz completion) have no visual confirmation beyond the page changing. SaaS platforms always show a toast notification for successful actions. The `sonner` package is already installed.

**Actions that need toasts:**
- Quiz submitted successfully → `toast.success("Quiz complete! +50 XP earned")`
- Daily quest completed → `toast.success("🔥 Streak maintained! Day " + streak)`
- Level up → (this has the modal, which is good)

---

### SAAS-03 · No keyboard shortcut hints on quiz player
**Severity:** Low  

The quiz player has `← →` keyboard navigation but it's only hinted in tiny text at the bottom. SaaS tools display keyboard shortcuts prominently or in tooltips. Add keyboard shortcut badges to the Previous/Next buttons:

```tsx
<Button>
  <ArrowLeft className="h-3 w-3" />
  Previous
  <kbd className="ml-2 text-[9px] bg-muted px-1 rounded">←</kbd>
</Button>
```

---

### SAAS-04 · No empty state on quizzes page when no daily quizzes exist
**Severity:** Medium  

When `quizzes.length === 0`, the page shows:
```
Daily quests are being prepared. Check back soon!
```

with no visual, no countdown, no action. Add a proper empty state with an illustration/icon and a countdown to midnight when quizzes refresh.

---

### SAAS-05 · No page titles set on platform pages
**Severity:** Low  

The root `app/layout.tsx` sets a default title "QuizAI — Intelligent Quiz Platform". But none of the platform pages (`/dashboard`, `/quiz`, `/leaderboard`, `/profile`) export `metadata` objects to override the title. Browser tabs all show the default title regardless of which page you're on.

**Fix:** Add to each platform page:
```tsx
// dashboard/page.tsx
export const metadata = { title: "Dashboard" };
// This produces: "Dashboard | QuizAI"
```

---

### SAAS-06 · No loading skeleton on leaderboard — only a generic Skeleton component
**Severity:** Low  

The leaderboard loading state shows three identical grey rectangles. It should match the actual leaderboard structure — a skeleton podium and skeleton table rows — so the page doesn't feel jarring on load.

---

## 11. Micro-interactions & Animation

### ANIM-01 · Quiz option selection has no animation — feels laggy
**Severity:** Medium  

`quiz-option.tsx` uses `whileTap={{ scale: 0.995 }}` — a barely perceptible 0.5% scale. The colour transition `duration-150` is fast but the label badge (A/B/C/D → checkmark/X) changes instantly. Add a brief scale-in animation to the label icon on state change.

---

### ANIM-02 · Daily quest cards in dashboard have no hover state beyond background change
**Severity:** Low  

The daily quiz widget cards use `hover:bg-muted/60` and an arrow icon colour change. Modern SaaS cards also lift slightly on hover (subtle `translateY(-1px)`) and show a border colour change.

---

### ANIM-03 · Page transitions are missing between platform pages
**Severity:** Low  

The `<PageTransition>` component exists (`components/shared/page-transition.tsx`) but is not used in the platform layout. Routes change instantly without any transition. Wrap the main content area:
```tsx
<PageTransition key={pathname}>
  {children}
</PageTransition>
```

---

### ANIM-04 · Stats cards animate individually but without stagger
**Severity:** Low  

The dashboard stats render via `<DashboardStats>` but all cards appear simultaneously. A 50ms stagger between cards (like the leaderboard rows already do) makes the page feel more polished.

---

## 12. Accessibility Issues

### A11Y-01 · Theme toggle has overlapping hidden icons causing flash
**Severity:** Medium  

```tsx
<Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
<Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
```

Both icons exist in the DOM simultaneously — one is just scaled to 0. Screen readers may read both icons. Use `aria-hidden` on the hidden icon or conditionally render:
```tsx
{resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
```

---

### A11Y-02 · Quiz options use `role="radio"` but are not inside a `role="radiogroup"`
**Severity:** Medium  

`quiz-option.tsx` sets `role="radio"` and `aria-checked` on each option. This is semantically correct but requires the parent to have `role="radiogroup"`. In `play/page.tsx` the parent div uses `role="radiogroup"` — correct. But in `quiz-playing-state.tsx` the parent div uses `role="radiogroup"` and `aria-label` — also correct. Verify both paths are consistent.

---

### A11Y-03 · Mobile nav `<SheetTrigger>` renders an empty button
**Severity:** Medium  

In `mobile-nav.tsx`:
```tsx
<SheetTrigger render={
  <Button variant="ghost" size="icon" aria-label="Toggle navigation menu" />
}>
  <Menu className="h-4 w-4" />
</SheetTrigger>
```

The `<Menu>` icon is a child of `<SheetTrigger>`, not of the `<Button>`. The rendered button may be empty depending on how Base UI's `render` prop works. Test with a screen reader to confirm the button is accessible.

---

### A11Y-04 · No skip-to-content link
**Severity:** Low  

Standard accessibility requirement for apps with fixed navigation. Add before the sidebar:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
  Skip to main content
</a>
```

---

## 13. Priority Execution Plan

### 🔴 P1 — Fix Immediately (Broken or Shows Debug Text to Users)

| # | Issue | File | Impact |
|---|---|---|---|
| 1 | PROF-03: Remove "text-neutral-400" debug strings | `profile/page.tsx` | Shows raw code to users |
| 2 | DASH-03: Fix daily quest link — use `quiz.type` not `quiz.id` | `daily-quiz-widget.tsx` | All daily quiz links broken |
| 3 | PROF-01: Fix "Joined undefined" — guard or implement `memberSince` | `profile/page.tsx` | Shows "undefined" |
| 4 | PROF-04: Remove "Time Taken" column (data never provided) | `profile/page.tsx` | Shows "NaN m NaNs" |
| 5 | LOGIN-02: Implement forgot password | `login/page.tsx` | Dead button |
| 6 | PROF-06: Rename "Detailed Stats Grid" heading | `profile/page.tsx` | Dev label shown |
| 7 | SAAS-01 · Add Toaster to layout.tsx | `app/layout.tsx` | Toasts never show |
| 8 | DS-04: Add `<Toaster />` to root layout | `app/layout.tsx` | Sonner broken |

### 🟡 P2 — Design System Unification

| # | Issue | File | Impact |
|---|---|---|---|
| 9 | DS-01: Replace all hardcoded colours with tokens | All landing + quiz components | Dark mode breaks |
| 10 | DS-02: Replace all raw `<button>` with `<Button>` component | hero, cta-section, how-it-works | Inconsistent UI |
| 11 | LAND-03: Replace broken Google-hosted logo images | `hero.tsx` | Broken images |
| 12 | LOGIN-01: Replace "monolith" copy | `login/page.tsx` | Confusing UX |
| 13 | LOGIN-04: Send name to Firebase after email signup | `login/page.tsx` | Names never saved |
| 14 | DASH-01: Enrich welcome banner with streak + XP | `welcome-banner.tsx` | Wasted space |
| 15 | DASH-02: Remove "Database data" badge | `dashboard/page.tsx` | Dev label shown |
| 16 | PROF-02: Implement or hide Edit Profile button | `profile/page.tsx` | Dead button |

### 🟢 P3 — Responsiveness & Layout

| # | Issue | File | Impact |
|---|---|---|---|
| 17 | DASH-04: Change dashboard grid from `xl:` to `lg:` breakpoint | `dashboard/page.tsx` | Broken on laptops |
| 18 | RESP-01: Fix dashboard bottom row tablet grid | `dashboard/page.tsx` | Broken on tablets |
| 19 | RESP-03: Add `min-w-[560px]` to leaderboard table | `leaderboard/page.tsx` | Table broken mobile |
| 20 | LEAD-01: Fix mobile podium visual hierarchy | `leaderboard/page.tsx` | Ranks look identical |
| 21 | LEAD-02: Fix accuracy colour (not always green) | `leaderboard/page.tsx` | Misleading data |
| 22 | LEAD-03: Highlight current user in leaderboard | `leaderboard/page.tsx` | Missing SaaS feature |
| 23 | NAV-01: Persist sidebar collapse state | `sidebar.tsx` | UX regression |
| 24 | NAV-04: Fix content margin when sidebar collapses | `platform/layout.tsx` | Layout shift |

### 🔵 P4 — SaaS Polish & Features

| # | Issue | File | Impact |
|---|---|---|---|
| 25 | SAAS-01: Add new user onboarding banner | `dashboard/page.tsx` | No guidance for new users |
| 26 | SAAS-02: Add toast on quiz submission | `use-adaptive-quiz.ts` | No success feedback |
| 27 | LAND-01: Add product screenshot/mockup to hero | `hero.tsx` | No product preview |
| 28 | LAND-02: Rewrite hero copy to be benefit-focused | `hero.tsx` | Jargon repels users |
| 29 | LAND-05: Upgrade features to bento grid | `features.tsx` | Generic appearance |
| 30 | LAND-06: Remove or build `/pricing` page | `navbar.tsx` | Dead link |
| 31 | PROF-05: Replace empty achievements tab with locked badges | `profile/page.tsx` | Wasted tab |
| 32 | QUIZ-01: Add rich metadata to quiz catalogue cards | `quiz/page.tsx` | Thin UI |
| 33 | ANIM-03: Use `<PageTransition>` in platform layout | `platform/layout.tsx` | No page transitions |
| 34 | DS-03: Apply `font-heading` to all `<h1>` and `<h2>` | Global | Typography unused |
| 35 | SAAS-05: Add `metadata` export to all platform pages | All pages | Tabs show wrong title |
| 36 | QUIZ-03: Add optional timer to adaptive quiz | `play/page.tsx` | Inconsistent with daily |
| 37 | LEAD-04: Add no-results state to leaderboard search | `leaderboard/page.tsx` | Empty table on search |
| 38 | DASH-05: Add colour differentiation to stats cards | `dashboard-stats.tsx` | All cards look same |

---

*End of Report — 38 issues: 8 critical · 8 design system · 8 responsiveness · 14 SaaS polish*
