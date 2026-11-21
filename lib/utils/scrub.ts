import type { ErrorEvent } from "@sentry/nextjs";

const REDACTED = "[redacted]";

const PERSONAL = [
    /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
    /\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g,
    /\bBearer\s+[\w.~+/=-]+/gi,
    /\+?\d[\d\s().-]{7,}\d/g,
];

export const scrub = (text: string) => PERSONAL.reduce((clean, pattern) => clean.replace(pattern, REDACTED), text);

export const scrubEvent = (event: ErrorEvent): ErrorEvent => ({
    ...event,
    user: undefined,
    message: event.message === undefined ? undefined : scrub(event.message),
    exception: event.exception && {
        ...event.exception,
        values: event.exception.values?.map((entry) => ({ ...entry, value: entry.value === undefined ? undefined : scrub(entry.value) })),
    },
    request: event.request && { url: event.request.url, method: event.request.method },
});
