import { parseAbsolute, parseDate, toZoned } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { UI_LOCALE } from "@/lib/ui/constants";

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

export const zoneLabel = (timeZone: string) =>
    new Intl.DateTimeFormat(UI_LOCALE, { timeZone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value ?? timeZone;
