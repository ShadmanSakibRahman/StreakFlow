# Implementation Plan: StreakFlow Habit Tracker

## Overview

Build a habit tracker with Next.js (static export), Firebase (Auth + Firestore), and GitHub Pages hosting. Google sign-in, real-time cross-device sync, premium UI. $0 forever.

## Phase 1: Foundation — Clean Up, Firebase Setup & Core Utilities

Strip unused boilerplate, install Firebase, create config and utility files.

### Tasks

- [ ] Remove unused boilerplate files (auth pages, chat, profile, API routes, DB/auth libs, drizzle config, docker-compose)
- [ ] Install `firebase` npm package
- [ ] Configure Next.js for static export (`output: "export"` in `next.config.ts`)
- [ ] Create `src/lib/firebase.ts` — Firebase app initialization + Auth + Firestore exports
- [ ] Create `src/lib/types.ts` — all TypeScript types
- [ ] Create `src/lib/constants.ts` — EMOJI_OPTIONS, COLOR_OPTIONS, DAY_NAMES, demo data generator
- [ ] Create `src/lib/streak-utils.ts` — streak calculation utilities (pure functions)

### Technical Details

**Files to remove:**
- `src/app/(auth)/` — entire directory
- `src/app/chat/` — entire directory
- `src/app/profile/` — entire directory
- `src/app/api/` — entire directory
- `src/components/auth/` — entire directory
- `src/components/setup-checklist.tsx`, `src/components/starter-prompt-modal.tsx`
- `src/hooks/use-diagnostics.ts`
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/db.ts`, `src/lib/schema.ts`
- `src/lib/storage.ts`, `src/lib/session.ts`, `src/lib/env.ts`
- `src/proxy.ts`
- `drizzle.config.ts`, `docker-compose.yml`, `drizzle/` folder

**Install:**
```bash
pnpm add firebase
```

**next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // basePath will be set to "/repo-name" for GitHub Pages production
};
```

**Firebase config (`src/lib/firebase.ts`):**
```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

Note: Firebase API keys are safe to expose in client-side code — they're just project identifiers. Security is handled by Firestore rules.

**Environment variables (`.env.local`):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

**Types (`src/lib/types.ts`):**
```typescript
export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequency: Frequency;
  customDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  archived: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Completion {
  id: string;
  habitId: string;
  completedDate: string; // "YYYY-MM-DD"
  createdAt: string;
}

export type SortOption = "name" | "newest" | "oldest" | "streak";
export type FilterOption = "all" | "active" | "archived" | "daily" | "weekly" | "custom";
```

**Streak utils (`src/lib/streak-utils.ts`):**
- `formatDate(date: Date): string` → "YYYY-MM-DD"
- `parseDate(str: string): Date`
- `isHabitDueOnDate(habit: Habit, date: Date): boolean`
- `getCurrentStreak(habit: Habit, completionDates: string[]): number`
- `getLongestStreak(habit: Habit, completionDates: string[]): number`
- `getCompletionRate(habit: Habit, completionDates: string[], days: number): number`
- `getTodayString(): string`
- `isToday(dateStr: string): boolean`
- `getWeekDates(): string[]` — Mon to Sun of current week

**Constants (`src/lib/constants.ts`):**
- `EMOJI_OPTIONS`: 30 habit emojis
- `COLOR_OPTIONS`: 10 colors with name, hex, Tailwind bg/text/ring classes
- `DAY_NAMES`: ["Sun", "Mon", ...]
- `DAY_NAMES_FULL`: ["Sunday", "Monday", ...]
- `generateDemoHabits()`: returns Habit[] with 6-8 sample habits
- `generateDemoCompletions(habits)`: returns Completion[] with 30 days of data

## Phase 2: Firebase Hooks — Auth & Data

Create React hooks for Firebase Auth and Firestore CRUD.

### Tasks

- [ ] Create `src/hooks/use-auth.ts` — Firebase Auth hook (Google sign-in, sign-out, auth state)
- [ ] Create `src/hooks/use-habits.ts` — Firestore CRUD for habits (real-time listener)
- [ ] Create `src/hooks/use-completions.ts` — Firestore CRUD for completions (real-time listener)
- [ ] Create `src/components/auth-guard.tsx` — wrapper component that shows login if not authenticated

### Technical Details

**useAuth hook (`src/hooks/use-auth.ts`):**
```typescript
"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { user, loading, signInWithGoogle, logout };
}
```

**useHabits hook (`src/hooks/use-habits.ts`):**
Uses Firestore real-time listeners (`onSnapshot`) so data syncs instantly across devices.
```typescript
export function useHabits(userId: string) {
  return {
    habits: Habit[],
    loading: boolean,
    addHabit(data: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<void>,
    updateHabit(id: string, data: Partial<Habit>): Promise<void>,
    deleteHabit(id: string): Promise<void>,
    archiveHabit(id: string): Promise<void>,
    restoreHabit(id: string): Promise<void>,
    loadDemoData(): Promise<void>,
    clearAllHabits(): Promise<void>,
  }
}
```

Firestore path: `users/{userId}/habits/{habitId}`

**useCompletions hook (`src/hooks/use-completions.ts`):**
```typescript
export function useCompletions(userId: string) {
  return {
    completions: Completion[],
    loading: boolean,
    toggleCompletion(habitId: string, date?: string): Promise<void>,
    isCompleted(habitId: string, date?: string): boolean,
    getCompletionsForHabit(habitId: string): string[], // returns date strings
    clearAllCompletions(): Promise<void>,
  }
}
```

Firestore path: `users/{userId}/completions/{completionId}`

Toggle logic: Query for existing completion with matching habitId + completedDate. If exists, delete it. If not, create it.

**AuthGuard (`src/components/auth-guard.tsx`):**
```typescript
"use client";
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <redirect to login or show sign-in>;
  return children;
}
```

## Phase 3: UI Components

Build all habit-specific React components.

### Tasks

- [ ] Create `src/components/habits/habit-form.tsx` — Dialog-based create/edit form [complex]
  - [ ] Name input (required, max 50 chars)
  - [ ] Description input (optional, max 200 chars)
  - [ ] Emoji picker grid (scrollable)
  - [ ] Color picker circles
  - [ ] Frequency toggle (daily/weekly/custom) with day selector
  - [ ] Form validation and loading state
- [ ] Create `src/components/habits/habit-card.tsx` — Card with completion toggle, streak, actions menu
- [ ] Create `src/components/habits/daily-summary.tsx` — Circular SVG progress ring with stats
- [ ] Create `src/components/habits/streak-badge.tsx` — Inline streak display with flame icon
- [ ] Create `src/components/habits/empty-state.tsx` — Reusable empty state with icon, title, description, CTA

### Technical Details

**HabitForm:** Dialog from shadcn. On submit calls `addHabit` or `updateHabit` from useHabits hook. Shows loading spinner during Firestore write. Emoji picker = scrollable 6-column grid. Color picker = row of 10 circles. Frequency = 3 toggle buttons. Custom reveals 7 day toggles (S M T W T F S). Validation: name required, custom needs ≥1 day.

**HabitCard:**
- Color accent via 4px left border using habit.color
- Completed: subtle green background tint, filled CheckCircle
- Archived: opacity-60, "Archived" badge
- MoreVertical dropdown: Edit, Archive/Restore, Separator, Delete (destructive)
- Streak: Flame icon + current, Trophy icon + longest (smaller text)
- Completion toggle: large tap target (48px), calls `toggleCompletion`
- Smooth transitions on all state changes

**DailySummary:** SVG ring ~100px. Two circles: background (muted) + progress (colored). stroke-dasharray for arc animation. Percentage in center. "X of Y completed" below. 100% = green. 0% = encouraging message.

**StreakBadge:** Flame icon + number. Orange/red for active streaks. If current === longest && > 0, show gold star or "Best!" label.

**EmptyState:** Centered icon + title + description + optional CTA button. Used on dashboard (no habits), habits page (no matches), analytics (no data).

**All components:** `"use client"`, named exports, mobile-first, dark mode compatible, 44px+ touch targets.

## Phase 4: Pages & Navigation

Build all app pages and update navigation.

### Tasks

- [ ] Update `src/components/site-header.tsx` — StreakFlow branding, nav links, theme toggle, user avatar, sign out [complex]
  - [ ] Logo: "StreakFlow" on left
  - [ ] Nav links (when signed in): Dashboard, Habits, Analytics, Settings
  - [ ] Right side: theme toggle, user avatar (from Google), sign out
  - [ ] Mobile: hamburger menu with dropdown/sheet
  - [ ] Active link highlighting with usePathname()
- [ ] Update `src/components/site-footer.tsx` — Minimal footer
- [ ] Update `src/app/layout.tsx` — Clean root layout with ThemeProvider + Toaster, no server auth
- [ ] Create `src/app/page.tsx` — Public landing page [complex]
  - [ ] Hero: "StreakFlow" gradient text, tagline, "Get Started" CTA
  - [ ] Feature grid: 6 cards with icons
  - [ ] Clean premium design
- [ ] Create `src/app/login/page.tsx` — Sign-in page with Google button
- [ ] Create `src/app/dashboard/page.tsx` — Today's view [complex]
  - [ ] AuthGuard wrapper
  - [ ] Greeting: "Good morning, {name}!"
  - [ ] DailySummary ring
  - [ ] Habits due today with completion toggles
  - [ ] Quick "Add Habit" button
  - [ ] Empty state if no habits
- [ ] Create `src/app/habits/page.tsx` — Full habit management [complex]
  - [ ] AuthGuard wrapper
  - [ ] Search bar + Filter dropdown + Sort dropdown + Add Habit button
  - [ ] Habit cards grid/list
  - [ ] Empty states (no habits / no search matches)
- [ ] Create `src/app/analytics/page.tsx` — Simple analytics
  - [ ] AuthGuard wrapper
  - [ ] Weekly completion bar chart (7 CSS bars)
  - [ ] Streak leaderboard (top habits by current streak)
  - [ ] Overall completion rate
- [ ] Create `src/app/settings/page.tsx` — Settings page
  - [ ] AuthGuard wrapper
  - [ ] Account info card (Google name, email, avatar, sign out)
  - [ ] Theme toggle card
  - [ ] Export data card (downloads JSON)
  - [ ] Load demo data card (with confirmation)
  - [ ] Clear all data card (destructive, with confirmation)

### Technical Details

**Landing page features grid (6 cards):**
1. Flame — "Streak Tracking" — "Never break the chain"
2. Calendar — "Flexible Schedules" — "Daily, weekly, or custom days"
3. BarChart3 — "Visual Progress" — "See your growth at a glance"
4. Moon — "Dark Mode" — "Easy on the eyes"
5. Smartphone — "Works Everywhere" — "Phone, tablet, or desktop"
6. Shield — "Secure & Private" — "Your data, your Google account"

**Login page:** Centered card with StreakFlow logo, "Sign in to continue" text, large "Sign in with Google" button with Google icon. Clean, minimal.

**Dashboard greeting:** Use time of day: "Good morning/afternoon/evening, {firstName}!"

**Dashboard layout:**
```
[Greeting]
[DailySummary ring - centered]
[Habits Due Today - responsive grid (1 col mobile, 2 col desktop)]
[+ Add Habit button - bottom right or after list]
```

**Habits page toolbar:**
```
Mobile:  [Search...........]
         [Filter ▼] [Sort ▼] [+ New Habit]
Desktop: [Search...........] [Filter ▼] [Sort ▼] [+ New Habit]
```

Search/filter/sort state is local React state (instant, client-side).

**Analytics bar chart:** 7 flex columns. Each column = one day (Mon-Sun). Bar div with dynamic height (% of max). Color: green ≥80%, yellow ≥50%, red <50%. Day label below. Completion fraction above bar (e.g. "3/5").

**Settings cards:** Stack of Card components. Each has title, description, action button. Destructive actions (clear data) use red button and confirmation Dialog.

**Export data:** Collect all habits + completions from Firestore, build JSON object, create Blob, trigger download as `streakflow-backup-{date}.json`.

## Phase 5: Firestore Security Rules & Deployment

Set up Firestore security, polish, and deploy.

### Tasks

- [ ] Create Firestore security rules (users can only read/write their own data)
- [ ] Update `src/app/globals.css` — transitions, animations, gradient text, mobile touch styles
- [ ] Add micro-animations — completion toggle bounce, card hover, progress ring animation
- [ ] Mobile audit — 44px+ touch targets, proper spacing, no horizontal scroll
- [ ] Dark mode audit — all colors work in both themes
- [ ] Update `src/app/manifest.ts` — StreakFlow PWA metadata
- [ ] Update `src/app/robots.ts` and `src/app/sitemap.ts`
- [ ] Update `README.md` — setup instructions, deployment guide
- [ ] Create `.github/workflows/deploy.yml` — GitHub Actions for auto-deploy to GitHub Pages
- [ ] Verify build works (`pnpm build`)

### Technical Details

**Firestore security rules (set in Firebase Console):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
This ensures each user can only access their own data.

**CSS additions:**
- `.animate-check` — keyframe: scale 0.8 → 1.1 → 1.0 (200ms ease-out)
- `.gradient-text` — purple-to-blue gradient text for hero
- Smooth scroll, thin custom scrollbar
- `-webkit-tap-highlight-color: transparent` on buttons
- `env(safe-area-inset-bottom)` padding for notched phones

**GitHub Actions workflow (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Firebase config values are stored as GitHub Secrets (Settings → Secrets → Actions). These are safe to expose in client code but secrets keep them organized.

**README.md deployment guide:**
```markdown
## Deploy (Free Forever)

### 1. Create Firebase Project
- Go to console.firebase.google.com
- Create project → Enable Authentication (Google provider) → Create Firestore database
- Copy config values from Project Settings → General → Your apps → Web app

### 2. Deploy to GitHub Pages
- Push repo to GitHub
- Go to repo Settings → Secrets → add Firebase config values
- Go to Settings → Pages → Source: GitHub Actions
- Push to main → auto-deploys
- Live at https://username.github.io/repo-name/

### 3. Set up Firestore Rules
- In Firebase Console → Firestore → Rules → paste security rules → Publish
```
