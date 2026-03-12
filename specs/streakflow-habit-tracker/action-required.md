# Action Required: StreakFlow Habit Tracker

Manual steps that must be completed by a human. These cannot be automated.

**Everything below is 100% free — no credit card, no trial, no expiration.**

## Before Implementation

- [ ] **Create Firebase project** — Go to [console.firebase.google.com](https://console.firebase.google.com), sign in with Google (free):
  1. Click "Create a project" → name it "streakflow" → Continue
  2. Disable Google Analytics (not needed) → Create Project
  3. In left sidebar → Build → Authentication → Get Started → Sign-in method → Google → Enable → Save
  4. In left sidebar → Build → Firestore Database → Create Database → Start in test mode → choose nearest region → Create
  5. Go to Project Settings (gear icon) → General → scroll to "Your apps" → click Web icon (</>) → name it "streakflow-web" → Register → copy the config values

- [ ] **Create `.env.local` file** — Add Firebase config values (I'll help with this once you have them):
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
  NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
  ```

## During Implementation

Nothing — I handle everything from here.

## After Implementation

- [ ] **Set Firestore security rules** — In Firebase Console → Firestore → Rules → replace with:
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
  Then click "Publish"

- [ ] **Push to GitHub** — Create a public repo and push the code

- [ ] **Add GitHub Secrets** — In repo Settings → Secrets and variables → Actions → add each Firebase config value as a secret

- [ ] **Enable GitHub Pages** — In repo Settings → Pages → Source: "GitHub Actions"

- [ ] **Push to main** — GitHub Actions auto-builds and deploys (~2 minutes)

## Cost Summary

| What | Cost | Card Required |
|------|------|---------------|
| Firebase (Auth + Firestore) | $0 forever | No |
| GitHub (code + hosting) | $0 forever | No |
| **Total** | **$0 forever** | **No** |

---

> **Note:** I will walk you through each step when we get there. You don't need to do anything right now.
