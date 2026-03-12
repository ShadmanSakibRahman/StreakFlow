# StreakFlow — Habit Tracker

## Tech Stack
- **Framework**: Next.js 16 (static export), React 19, TypeScript (strict)
- **Database**: Firebase Firestore (free Spark plan)
- **Auth**: Firebase Auth (Google sign-in)
- **Hosting**: GitHub Pages (free)
- **UI**: shadcn/ui + Tailwind CSS 4 + Lucide React
- **Dark Mode**: next-themes

## Key Architecture
- Static export (`output: "export"`) — no server-side code
- Firebase JS SDK runs entirely client-side
- Firestore path: `users/{uid}/habits/{id}` and `users/{uid}/completions/{id}`
- Real-time sync via `onSnapshot` listeners
- Streaks calculated client-side from completion data

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — build static export to `out/`
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run TypeScript type checking

## File Structure
- `src/hooks/use-auth.ts` — Firebase Auth hook
- `src/hooks/use-habits.ts` — Firestore CRUD for habits
- `src/hooks/use-completions.ts` — Firestore completions
- `src/lib/firebase.ts` — Firebase initialization
- `src/lib/types.ts` — TypeScript types
- `src/lib/constants.ts` — Emojis, colors, demo data
- `src/lib/streak-utils.ts` — Streak calculation utilities
- `src/components/habits/` — Habit UI components

## Important Notes
- Firebase API keys in `.env.local` are safe to expose (client identifiers only)
- Security is handled by Firestore security rules
- Copyright: Md. Shadman Sakib Rahman
