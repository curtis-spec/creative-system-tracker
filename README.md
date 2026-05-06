# Creative System Tracker

A web-based React + Vite internal onboarding tracker for interns learning a creative operating system.

## What It Tracks

- Intern profile, mentor, start date, development focus, and growth goal
- Daily learning logs
- Weekly checkpoints
- Onboarding calendar events and reminders
- Video Bible lessons with 5-question knowledge checks
- Saved archive, printable reports, exports, and slide-deck style summaries
- Final demonstration evidence, status, mentor notes, and rubric scores
- Readiness score based on completed logs, checkpoints, and final demonstration fields

## Local Setup

```bash
npm install
npm run dev
```

Without Supabase environment variables, the app runs in local demo mode and saves to `localStorage`.

To connect Supabase, copy `.env.example` to `.env.local` and fill in your project values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Setup

1. Create a Supabase project.
2. Enable Email under Authentication providers.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Add your deployed Vercel URL under Authentication URL Configuration.

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Use the Vite framework preset.
4. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
```
