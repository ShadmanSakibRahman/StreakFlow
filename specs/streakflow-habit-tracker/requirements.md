# Requirements: StreakFlow Habit Tracker

## Overview

StreakFlow is a clean, modern, minimal habit tracker app. It focuses on habit creation, daily tracking, streaks, and progress with a premium-looking responsive UI. The experience should feel calm, modern, and well-designed — not cluttered or overly complex.

**Approach:** Static Next.js app hosted on GitHub Pages. Firebase for auth (Google sign-in) and database (Firestore). Cross-device sync built-in. $0 forever — no card, no trial, no expiry.

## Final Stack — $0 Forever

| Component | Service | Cost | Card | Why Free Forever |
|-----------|---------|------|------|------------------|
| Code hosting | GitHub | $0 | No | Core Microsoft product, free since 2008 |
| App hosting | GitHub Pages | $0 | No | Free for public repos, always has been |
| Database | Firebase Firestore | $0 | No | Google Cloud core product, free Spark plan since 2012 |
| Auth | Firebase Auth (Google sign-in) | $0 | No | Part of Firebase, 50K monthly users free |
| Framework | Next.js 16 (static export) | $0 | No | Open source (MIT) |
| UI | shadcn/ui + Tailwind CSS 4 | $0 | No | Open source |
| Icons | Lucide React | $0 | No | Open source (ISC) |

**Total: $0/month, $0/year, $0 forever. No credit card needed anywhere.**

### Firebase Free Limits (Spark Plan)

| Resource | Free Limit | Enough? |
|----------|-----------|---------|
| Firestore storage | 1GB | Yes — ~10,000+ users for 3 months |
| Firestore reads | 50,000/day | Yes — ~500 daily active users |
| Firestore writes | 20,000/day | Yes — ~200 daily active users |
| Auth users | 50,000/month | Way more than enough |
| Hosting | Not used (GitHub Pages instead) | N/A |

If daily limits are hit, app pauses until next day — no charges, no surprise bills.

## Core Features

### Authentication (Firebase Auth)
- One-click Google sign-in (users click "Sign in with Google" — done)
- Session persists across browser sessions (Firebase handles this)
- Protected routes — dashboard, habits, analytics, settings require sign-in
- Landing page is public
- User profile: name and avatar from Google account
- Sign out button

### Habit Management
- Create a habit with name, description, emoji, color, frequency
- Edit existing habits
- Delete habits (with confirmation)
- Archive habits (soft-remove from active view)
- Restore archived habits
- All habits scoped to the authenticated user's UID in Firestore

### Frequency Options
- **Daily** — due every day
- **Weekly** — due once per week (on the day it was created)
- **Custom** — due on specific days of the week (user selects days)

### Completion Tracking
- Mark a habit as complete for today
- Unmark (undo) a habit for today
- Visual toggle with satisfying completed state
- Syncs instantly across devices (Firestore real-time)

### Streaks & Progress
- **Current streak** — consecutive due dates completed going backwards from today
- **Longest streak** — best ever consecutive streak
- **Today's summary** — X of Y habits completed, percentage ring
- Streaks account for habit frequency (only counts due dates)
- Streaks calculated client-side from completion data (not stored in DB)

### Organization
- Search habits by name or description
- Filter: All, Active, Archived, Daily, Weekly, Custom
- Sort: Name (A-Z), Newest, Oldest, Streak (highest first)

### Data Management
- **Demo data** — load sample habits to explore the app
- **Export** — download habits as JSON file (backup)
- **Clear data** — reset all habits and completions (with confirmation)

### Cross-Device Sync
- Automatic — sign in on any device with Google, see your data
- Real-time — mark a habit on phone, see it on laptop instantly
- No manual transfer codes needed (Firebase handles sync)

### UI/UX
- Dark mode with next-themes
- Responsive design — works on all modern phones and PCs
- Empty states with friendly messaging and CTAs
- Premium, minimal aesthetic — GitHub-worthy polish
- Sonner toast notifications for actions
- Mobile-first design (touch-friendly, 44px+ tap targets)

## Device & Browser Compatibility

Must work on all modern browsers:
- Chrome (Android + Desktop)
- Safari (iOS + macOS)
- Firefox (Desktop + Android)
- Edge (Desktop)
- Samsung Internet (Android)

Mobile considerations:
- Touch targets minimum 44x44px
- No hover-dependent interactions
- Proper viewport meta tag
- Safe area insets for notched phones

## Pages

| Page | Route | Access | Purpose |
|------|-------|--------|---------|
| Landing | `/` | Public | Hero, feature highlights, CTA to sign in |
| Dashboard | `/dashboard` | Signed in | Today's view — summary ring, habits due today |
| Habits | `/habits` | Signed in | Full habit management — CRUD, search, filter, sort |
| Analytics | `/analytics` | Signed in | Weekly chart, streak leaderboard, completion rate |
| Settings | `/settings` | Signed in | Theme, export, demo data, clear data, account info |

## Acceptance Criteria

1. User can sign in with Google in one click
2. User can create a habit with name, emoji, color, and frequency — it saves to Firestore
3. User can edit, delete, archive, and restore habits
4. User can toggle today's completion for any active habit due today
5. Current and longest streaks display correctly, accounting for frequency
6. Dashboard shows today's completion progress as a percentage ring
7. Search, filter, and sort work correctly together
8. Data syncs across devices automatically when signed in with same Google account
9. Demo data loads realistic sample habits
10. Dark mode works cleanly
11. App works on all modern phones and desktop browsers
12. Empty states display when no habits exist
13. Export downloads a valid JSON backup file
14. App loads from GitHub Pages with no errors
15. Touch targets are comfortable on mobile (44px+)
16. Entire app costs $0 — no external paid services
17. App stores at least 3 months of habit data per user within Firebase free limits

## Firestore Data Structure

```
users/
  {uid}/
    habits/
      {habitId}/
        name: string
        description: string
        emoji: string
        color: string
        frequency: "daily" | "weekly" | "custom"
        customDays: number[]
        archived: boolean
        createdAt: timestamp
        updatedAt: timestamp
    completions/
      {completionId}/
        habitId: string
        completedDate: string  // "YYYY-MM-DD"
        createdAt: timestamp
```

Each user's data is scoped under their Firebase UID. Firestore security rules ensure users can only read/write their own data.

## Dependencies

### Use from boilerplate (all open source, free)
- Next.js 16 + App Router (static export mode)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui components (Button, Card, Dialog, Input, Label, Badge, DropdownMenu, Separator, Skeleton, Sonner)
- next-themes (dark mode)
- Lucide React (icons)
- `cn()` utility from `@/lib/utils`

### Add (free, open source)
- `firebase` npm package — Firebase JS SDK for Auth + Firestore

### Do NOT use
- Database packages (Drizzle, pg, postgres) — using Firestore instead
- Authentication packages (Better Auth) — using Firebase Auth instead
- AI SDK (Vercel AI, OpenRouter) — not relevant
- File storage (Vercel Blob) — not needed
- Any paid service or anything requiring a credit card

### Remove from boilerplate
- `src/app/(auth)/` — replace with Firebase auth
- `src/app/chat/` — remove
- `src/app/profile/` — remove
- `src/app/api/` — remove entirely (no server routes, static export)
- `src/components/auth/` — replace with Google sign-in button
- `src/components/setup-checklist.tsx`, `starter-prompt-modal.tsx` — remove
- `src/hooks/use-diagnostics.ts` — remove
- `src/lib/auth.ts`, `auth-client.ts`, `db.ts`, `schema.ts`, `storage.ts`, `session.ts`, `env.ts` — remove
- `src/proxy.ts` — remove
- `drizzle.config.ts`, `docker-compose.yml`, `drizzle/` folder — remove

## Deployment

1. Push to GitHub (public repo, free)
2. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
3. Update `basePath` in `next.config.ts` to match repo name
4. Push to `main` — auto-deploys via GitHub Actions (~2 minutes)
5. App is live at `https://username.github.io/repo-name/`
