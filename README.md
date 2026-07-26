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

## Getting started

```bash
npm install
cp .env.example .env   # fill in AUTH_SECRET, SHANI/YONI email+password
npx prisma migrate dev
npm run seed            # creates the Shani & Yoni accounts
npm run dev
```

Then open http://localhost:3000 and sign in with the seeded credentials.
