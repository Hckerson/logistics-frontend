import { HTTP_STATUS } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import type { ActionFailure, FormProblem } from "@/lib/types";

interface Issue {
    path: readonly PropertyKey[];
    message: string;
}

const SECONDS_PER_MINUTE = 60;
const plural = new Intl.PluralRules("en");

export function issuesToProblems<F extends string>(
    issues: readonly Issue[],
    messages: Record<F, Record<string, string>>,
): FormProblem<F>[] {
    const seen = new Set<F>();
    return issues.flatMap((issue) => {
        const field = issue.path[0] as F;
        if (seen.has(field)) return [];
        seen.add(field);
        const options = messages[field];
        return [{ field, message: options[issue.message] ?? options.missing }];
    });
}

export function rateLimitProblem(retryAfter: unknown): FormProblem<never> {
    const seconds = Number(retryAfter);
    const { rateLimit, rateLimitUnknown } = AUTH_COPY.errors;
    return {
        message: seconds ? rateLimit.replace("{minutes}", String(Math.ceil(seconds / SECONDS_PER_MINUTE))) : rateLimitUnknown,
    };
}

export const requestFailure = ({ status, retryAfter }: ActionFailure): FormProblem<never> =>
    status === HTTP_STATUS.tooManyRequests ? rateLimitProblem(retryAfter) : { message: AUTH_COPY.errors.network };

export const problemCount = (count: number) =>
    (plural.select(count) === "one" ? AUTH_COPY.summary.one : AUTH_COPY.summary.other).replace("{count}", String(count));
