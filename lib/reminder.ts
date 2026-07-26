export type ReminderLike = {
  active: boolean;
  emailEnabled: boolean;
  emailTime: string | null; // "HH:MM"
  emailDaysOfWeek: string | null; // comma-separated 0-6 (Sun-Sat), null = every day
  telegramEnabled: boolean;
  telegramIntervalHours: number | null;
} | null;

function parseDaysOfWeek(daysOfWeek: string | null): number[] | null {
  if (!daysOfWeek) return null; // null = every day
  return daysOfWeek
    .split(",")
    .map((d) => parseInt(d, 10))
    .filter((d) => !Number.isNaN(d));
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isEmailDueOnDay(reminder: ReminderLike, date: Date): boolean {
  if (!reminder?.emailEnabled) return false;
  const days = parseDaysOfWeek(reminder.emailDaysOfWeek);
  if (!days) return true;
  return days.includes(date.getDay());
}

/** Has today's email fire-time already passed (given emailEnabled and it's an allowed day)? */
export function isEmailFireTimePassed(reminder: ReminderLike, now: Date): boolean {
  if (!reminder?.emailEnabled || !reminder.emailTime) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= timeToMinutes(reminder.emailTime);
}

/** Reminder is "due" for the in-app Today view / overdue badge (email channel). */
export function isEmailDueToday(
  reminder: ReminderLike,
  done: boolean,
  now: Date
): boolean {
  if (!reminder?.active || done) return false;
  return isEmailDueOnDay(reminder, now);
}

export function isEmailOverdue(
  reminder: ReminderLike,
  done: boolean,
  now: Date
): boolean {
  return isEmailDueToday(reminder, done, now) && isEmailFireTimePassed(reminder, now);
}

/** Telegram reminders recur all day, every N hours, so they're always "due today" while active. */
export function isTelegramActiveToday(
  reminder: ReminderLike,
  done: boolean
): boolean {
  if (!reminder?.active || done) return false;
  return Boolean(reminder.telegramEnabled && reminder.telegramIntervalHours);
}

export function hasAnyActiveReminder(
  reminder: ReminderLike,
  done: boolean,
  now: Date
): boolean {
  return isEmailDueToday(reminder, done, now) || isTelegramActiveToday(reminder, done);
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Short label for reminder badges, e.g. "daily @ 8:00pm", "every 3h", "Mon @ 8:00pm + every 3h". */
export function formatReminderSummary(reminder: ReminderLike): string | null {
  if (!reminder?.active) return null;
  const parts: string[] = [];

  if (reminder.emailEnabled && reminder.emailTime) {
    const days = parseDaysOfWeek(reminder.emailDaysOfWeek);
    const dayLabel = days
      ? days.map((d) => DAY_LABELS[d]).join("/")
      : "daily";
    parts.push(`📧 ${dayLabel} @ ${formatTime(reminder.emailTime)}`);
  }

  if (reminder.telegramEnabled && reminder.telegramIntervalHours) {
    parts.push(`📱 every ${reminder.telegramIntervalHours}h`);
  }

  return parts.length ? parts.join("  ") : null;
}
