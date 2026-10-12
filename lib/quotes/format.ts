import { RATE_CURRENCY, RATE_LOCALE } from "@/lib/quotes/constants";

const dollars = new Intl.NumberFormat(RATE_LOCALE, { style: "currency", currency: RATE_CURRENCY, maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat(RATE_LOCALE, { style: "currency", currency: RATE_CURRENCY, minimumFractionDigits: 2 });
const counts = new Intl.NumberFormat(RATE_LOCALE);
const percents = new Intl.NumberFormat(RATE_LOCALE, { style: "percent", maximumFractionDigits: 1 });
const days = new Intl.DateTimeFormat(RATE_LOCALE, { month: "short", day: "numeric", timeZone: "UTC" });
const pickups = new Intl.DateTimeFormat(RATE_LOCALE, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export const money = (value: number) => dollars.format(value);

export const perMileRate = (value: number) => cents.format(value);

export const count = (value: number) => counts.format(value);

export const percent = (value: number) => percents.format(value);

export const shortDay = (iso: string) => days.format(new Date(iso));

export const pickupDay = (iso: string) => pickups.format(new Date(iso));
