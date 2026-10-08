import { isAxiosError } from "axios";
import type { Credentials, FormProblem, SignInField } from "@/lib/types";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { signInSchema } from "@/lib/validations/auth";

const { errors, summary } = SIGN_IN_COPY;
const SECONDS_PER_MINUTE = 60;
const plural = new Intl.PluralRules("en");

const fieldMessage = (field: SignInField, key: string) => {
    const messages: Record<string, string> = errors[field];
    return messages[key] ?? messages.missing;
};

export function signInProblems(credentials: Credentials): FormProblem[] {
    const result = signInSchema.safeParse(credentials);
    if (result.success) return [];
    const seen = new Set<SignInField>();
    return result.error.issues.flatMap((issue) => {
        const field = issue.path[0] as SignInField;
        if (seen.has(field)) return [];
        seen.add(field);
        return [{ field, message: fieldMessage(field, issue.message) }];
    });
}

export function failureProblem(error: unknown): FormProblem {
    if (!isAxiosError(error) || !error.response) return { message: errors.network };
    const { status, headers } = error.response;
    if (status === 429) {
        const seconds = Number(headers["retry-after"]);
        return {
            message: seconds
                ? errors.rateLimit.replace("{minutes}", String(Math.ceil(seconds / SECONDS_PER_MINUTE)))
                : errors.rateLimitUnknown,
        };
    }
    return { message: status < 500 ? errors.credentials : errors.network };
}

export const problemCount = (count: number) =>
    (plural.select(count) === "one" ? summary.one : summary.other).replace("{count}", String(count));
