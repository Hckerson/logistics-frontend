import { AUTH_COPY } from "@/lib/data/auth/shared";
import { ERROR_COPY } from "@/lib/errors/constants";
import type { ActionFailure, FormProblem } from "@/lib/types";
import { errorClassOf, errorMessage } from "@/lib/utils/action-result";

interface Issue {
    path: readonly PropertyKey[];
    message: string;
}

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

export const rateLimitProblem = (retryAfter: unknown): FormProblem<never> => ({
    message: errorMessage({ errorClass: "rate-limit", retryAfter: Number(retryAfter) || undefined }),
});

export const requestFailure = (failure: ActionFailure): FormProblem<never> => ({ message: errorMessage(failure) });

export const responseFailure = (status: number): FormProblem<never> => ({ message: ERROR_COPY[errorClassOf(status)] });

export const problemCount = (count: number) =>
    (plural.select(count) === "one" ? AUTH_COPY.summary.one : AUTH_COPY.summary.other).replace("{count}", String(count));
