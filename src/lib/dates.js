/**
 * Single local-calendar date helper.
 * Always use YYYY-MM-DD in the user's local timezone.
 * Never use Date#toISOString() for calendar dates (UTC shift).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("formatLocalDate expects a valid Date");
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayISO() {
  return formatLocalDate(new Date());
}

export function parseLocalDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) {
    throw new Error(`parseLocalDate expects YYYY-MM-DD, received: ${iso}`);
  }
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isISODate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = parseLocalDate(value);
  return formatLocalDate(parsed) === value;
}

export function addDays(iso, amount) {
  const date = parseLocalDate(iso);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
}

export function daysBetween(startIso, endIso) {
  const start = parseLocalDate(startIso);
  const end = parseLocalDate(endIso);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function compareISO(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function minISO(a, b) {
  return compareISO(a, b) <= 0 ? a : b;
}

export function maxISO(a, b) {
  return compareISO(a, b) >= 0 ? a : b;
}

export function startOfMonth(iso) {
  const date = parseLocalDate(iso);
  return formatLocalDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(iso) {
  const date = parseLocalDate(iso);
  return formatLocalDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function addMonths(iso, amount) {
  const date = parseLocalDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return formatLocalDate(date);
}

export function weekdayIndex(iso) {
  return parseLocalDate(iso).getDay();
}

export function eachDay(startIso, endIso) {
  const days = [];
  let cursor = startIso;
  while (compareISO(cursor, endIso) <= 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function formatDisplayDate(iso, locale = "en-IN", options) {
  return parseLocalDate(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatWeekday(iso, locale = "en-IN") {
  return parseLocalDate(iso).toLocaleDateString(locale, { weekday: "long" });
}

export function formatMonthYear(iso, locale = "en-IN") {
  return parseLocalDate(iso).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

export function isSameMonth(a, b) {
  return startOfMonth(a) === startOfMonth(b);
}

export function monthGrid(monthIso, { weekStartsOn = 1 } = {}) {
  const start = startOfMonth(monthIso);
  const end = endOfMonth(monthIso);
  const offset = (weekdayIndex(start) - weekStartsOn + 7) % 7;
  const gridStart = addDays(start, -offset);
  const cells = [];
  let cursor = gridStart;
  for (let i = 0; i < 42; i += 1) {
    cells.push({
      date: cursor,
      inMonth: compareISO(cursor, start) >= 0 && compareISO(cursor, end) <= 0,
    });
    cursor = addDays(cursor, 1);
  }
  return { start, end, cells };
}
