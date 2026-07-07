import { DEFAULT_TIME_ZONE } from "@/lib/constants";

export function formatBeijingDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatBeijingShortDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DEFAULT_TIME_ZONE,
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function formatBeijingTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getBeijingDayRange(date = new Date()) {
  const start = new Date(`${getBeijingDateKey(date)}T00:00:00+08:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export function getBeijingWeekRange(date = new Date()) {
  const noon = new Date(`${getBeijingDateKey(date)}T12:00:00+08:00`);
  const utcDay = noon.getUTCDay();
  const daysSinceMonday = (utcDay + 6) % 7;
  const weekStartCursor = new Date(noon);
  weekStartCursor.setUTCDate(noon.getUTCDate() - daysSinceMonday);

  const start = new Date(`${getBeijingDateKey(weekStartCursor)}T00:00:00+08:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return { start, end };
}

function getBeijingDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to resolve Beijing date parts.");
  }

  return `${year}-${month}-${day}`;
}
