import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";
import type { ErrorClass } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { scrub } from "@/lib/utils/scrub";

interface ReportContext {
    route?: string;
    role?: string;
    errorClass?: ErrorClass;
    correlationId?: string;
}

const UNEXPECTED: readonly ErrorClass[] = ["server", "contract"];

const cleanError = (error: unknown) => {
    if (!(error instanceof Error)) return new Error(scrub(String(error)));
    const clean = new Error(scrub(error.message));
    clean.name = error.name;
    clean.stack = error.stack && scrub(error.stack);
    return clean;
};

export const reportError = (error: unknown, context: ReportContext = {}) => {
    if (!Sentry.getClient()) return;
    Sentry.withScope((scope) => {
        const tags = { route: context.route, role: context.role, error_class: context.errorClass, correlation_id: context.correlationId };
        scope.setTags(Object.fromEntries(Object.entries(tags).filter(([, value]) => value !== undefined)));
        Sentry.captureException(cleanError(error));
    });
};

export const reportUnexpected = (error: unknown) => {
    const failure = failureFrom(error);
    const errorClass = failure?.errorClass ?? (error instanceof ZodError ? "contract" : null);
    if (errorClass && UNEXPECTED.includes(errorClass)) reportError(error, { errorClass, correlationId: failure?.correlationId });
};
