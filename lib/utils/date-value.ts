import { now, parseAbsolute, parseDate, toZoned } from "@internationalized/date";
import type { DateRange, DateValue, RangeValue } from "react-aria-components";
import { UI_LOCALE } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { DateRangeValue } from "@/lib/types";

export const toDateValue = (value: string | null | undefined, timeZone: string | null): DateValue | null => {
    if (!value) return null;
    try {
        return timeZone ? parseAbsolute(value, timeZone) : parseDate(value);
    } catch {
        return null;
    }
};

export const fromDateValue = (value: DateValue | null, timeZone: string | null) => {
    if (value === null) return null;
    return timeZone ? toZoned(value, timeZone).toAbsoluteString() : value.toString();
};

export const toDateRange = (value: DateRangeValue | null, timeZone: string | null): DateRange | null => {
    const start = toDateValue(value?.start, timeZone);
    const end = toDateValue(value?.end, timeZone);
    return start && end ? { start, end } : null;
};

export const fromDateRange = (range: DateRange | null, timeZone: string | null): DateRangeValue | null => {
    const start = range && fromDateValue(range.start, timeZone);
    const end = range && fromDateValue(range.end, timeZone);
    return start && end ? { start, end } : null;
};

export const snapToStep = (value: DateValue, timeZone: string, step: number) => {
    const zoned = toZoned(value, timeZone);
    return zoned.set({ minute: 0, second: 0, millisecond: 0 }).add({ minutes: Math.round(zoned.minute / step) * step });
};

export const settleWindow = ({ start, end }: RangeValue<DateValue | null>, timeZone: string, step: number, minutes: number) => {
    if (!start) return null;
    const from = snapToStep(start, timeZone, step);
    const to = end ? snapToStep(end, timeZone, step) : from;
    return { start: from, end: to.compare(from) === 0 ? from.add({ minutes }) : to };
};

export const bookingBounds = (timeZone: string, step: number, horizonDays: number) => {
    const current = now(timeZone);
    const earliest = current.set({ minute: 0, second: 0, millisecond: 0 }).add({ minutes: Math.ceil(current.minute / step) * step });
    return { min: earliest.toAbsoluteString(), max: earliest.add({ days: horizonDays }).toAbsoluteString() };
};

export const boundOf = (value: DateValue | null, min: DateValue | null, max: DateValue | null) => {
    if (!value) return null;
    if (min && value.compare(min) < 0) return "early";
    return max && value.compare(max) > 0 ? "late" : null;
};

const UTC = "UTC";

export const formatBound = (value: DateValue, timeZone: string | null) =>
    new Intl.DateTimeFormat(UI_LOCALE, {
        dateStyle: "medium",
        timeStyle: timeZone ? "short" : undefined,
        timeZone: timeZone ?? UTC,
    }).format(timeZone ? toZoned(value, timeZone).toDate() : new Date(value.toString()));

export const boundMessage = (kind: "early" | "late", min: DateValue | null, max: DateValue | null, timeZone: string | null) => {
    const limit = kind === "early" ? min : max;
    if (!limit) return undefined;
    return fillTemplate(kind === "early" ? UI_COPY.dateTooEarly : UI_COPY.dateTooLate, { date: formatBound(limit, timeZone) });
};

export const boundsNote = (min: DateValue | null, max: DateValue | null, timeZone: string | null) => {
    if (min && max) return fillTemplate(UI_COPY.dateBetween, { from: formatBound(min, timeZone), to: formatBound(max, timeZone) });
    if (min) return fillTemplate(UI_COPY.dateTooEarly, { date: formatBound(min, timeZone) });
    return max ? fillTemplate(UI_COPY.dateTooLate, { date: formatBound(max, timeZone) }) : undefined;
};

export const sameDate = (a: DateValue | null, b: DateValue) => a !== null && a.compare(b) === 0;

export const zoneLabel = (timeZone: string) =>
    new Intl.DateTimeFormat(UI_LOCALE, { timeZone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value ?? timeZone;
