import { UI_LOCALE } from "@/lib/ui/constants";

export const BYTES_PER_KILOBYTE = 1024;

export const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;

const counts = new Intl.NumberFormat(UI_LOCALE);
const kilobytes = new Intl.NumberFormat(UI_LOCALE, { style: "unit", unit: "kilobyte", maximumFractionDigits: 0 });
const megabytes = new Intl.NumberFormat(UI_LOCALE, { style: "unit", unit: "megabyte", maximumFractionDigits: 1 });

export const grouped = (value: number) => counts.format(value);

export const fileSize = (bytes: number) =>
    bytes < BYTES_PER_MEGABYTE
        ? kilobytes.format(Math.max(1, bytes / BYTES_PER_KILOBYTE))
        : megabytes.format(bytes / BYTES_PER_MEGABYTE);
