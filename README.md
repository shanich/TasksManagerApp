# TasksManagerApp

A shared task/reminder app for two people. Organize tasks by topic, assign
them to each other, and set reminders that keep nagging until a task is
marked done.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, and
NextAuth.

## Status: Phase 1 (core app, in-app reminders only)

- Topics → tasks, with assign / notes / mark done / delete.
- Reminder fields (daily email time, Telegram interval) are configurable per
  task and drive the "Today" view and overdue badges — no messages are
  actually sent yet.
- Phase 2 will add real daily email delivery; Phase 3 will add recurring
  Telegram delivery. See `/root/.claude/plans` for the full phased plan, or
  ask for a recap.

## Getting started (local dev)

Requires a Postgres database (local or hosted — SQLite isn't used because it
doesn't survive serverless deploys like Vercel's).

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, SHANI/YONI email+password
npx prisma migrate dev
npm run seed            # creates the Shani & Yoni accounts
npm run dev
```

Then open http://localhost:3000 and sign in with the seeded credentials.

## Deploying (Vercel)

1. Create a free [Vercel](https://vercel.com) account (sign in with GitHub is
   easiest) and import this repo, branch `claude/shared-task-reminder-app-ilsigx`.
2. In the project's **Storage** tab, create a Postgres database (Vercel's
   native integration, powered by Neon) and connect it to the project — this
   auto-adds `POSTGRES_PRISMA_URL` and friends as env vars.
3. In **Settings → Environment Variables**, add:
   - `DATABASE_URL` — paste the same value as the `POSTGRES_PRISMA_URL` var
     from step 2.
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`.
   - `SHANI_EMAIL`, `SHANI_PASSWORD`, `YONI_EMAIL`, `YONI_PASSWORD` — your
     real login credentials for the app.
4. Deploy. The `vercel-build` script (see `package.json`) runs
   `prisma migrate deploy` and the seed script automatically on every build,
   so the database schema and the two accounts are always kept in sync — no
   manual migration/seed step needed on Vercel.
5. Open the URL Vercel gives you and sign in.
