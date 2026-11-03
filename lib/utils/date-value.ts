import { CalendarDate, parseAbsolute, parseDate, toZoned } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { UI_LOCALE } from "@/lib/ui/constants";

export const toDateValue = (value: string | null | undefined, timeZone: string, withTime: boolean): DateValue | null => {
    if (!value) return null;
    try {
        return withTime ? parseAbsolute(value, timeZone) : parseDate(value);
    } catch {
        return null;
    }
};

export const fromDateValue = (value: DateValue | null, timeZone: string) => {
    if (value === null) return null;
    return value instanceof CalendarDate ? value.toString() : toZoned(value, timeZone).toAbsoluteString();
};

export const zoneLabel = (timeZone: string) =>
    new Intl.DateTimeFormat(UI_LOCALE, { timeZone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value ?? timeZone;
