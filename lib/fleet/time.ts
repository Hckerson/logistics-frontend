import { TIME_MS } from "@/lib/constants";
import { FLEET } from "@/lib/fleet/constants";

const OFFSET = /GMT([+-])(\d{1,2})(?::(\d{2}))?/;
const NOON_HOURS = 12;
const MONDAY_SHIFT = 6;

export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const dayOf = (instant: number, timeZone: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);

const offsetMinutes = (instant: number, timeZone: string) => {
    const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(instant).find((part) => part.type === "timeZoneName")?.value ?? "";
    const match = OFFSET.exec(name);
    if (!match) return 0;
    return (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] ?? 0));
};

export const addDays = (day: string, count: number) => new Date(Date.parse(`${day}T00:00:00Z`) + count * TIME_MS.day).toISOString().slice(0, 10);

export const startOfDay = (day: string, timeZone: string) => {
    const utc = Date.parse(`${day}T00:00:00Z`);
    return utc - offsetMinutes(utc + NOON_HOURS * TIME_MS.hour, timeZone) * TIME_MS.minute;
};

export const weekStartOf = (day: string) => addDays(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + MONDAY_SHIFT) % FLEET.weekDays));

export const weekOf = (start: string) => Array.from({ length: FLEET.weekDays }, (_, index) => addDays(start, index));

export const assignmentDeadline = (windowStart: string) => Date.parse(windowStart) - FLEET.assignmentLeadHours * TIME_MS.hour;
