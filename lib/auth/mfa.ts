import type { FormProblem, MfaFailure, MfaMethod } from "@/lib/types";
import { rateLimitProblem, requestFailure } from "@/lib/auth/problems";
import { HTTP_STATUS } from "@/lib/constants";
import { MFA_COPY } from "@/lib/data/auth/mfa";
import { mfaAnswerSchema } from "@/lib/validations/auth";

const plural = new Intl.PluralRules("en");
const { errors } = MFA_COPY;

export function mfaProblems(method: MfaMethod, code: string): FormProblem[] {
    const result = mfaAnswerSchema.safeParse({ method, code });
    if (result.success) return [];
    const [issue] = result.error.issues;
    return [{ field: "code", message: issue?.message === "missing" ? errors[method].missing : errors[method].invalid }];
}

const attemptsLeft = (count: number | undefined) =>
    count === undefined ? errors.wrong.unknown : plural.select(count) === "one" ? errors.wrong.one : errors.wrong.other.replace("{count}", String(count));

export function mfaFailure(failure: MfaFailure): FormProblem {
    if (failure.status === HTTP_STATUS.unauthorized) return { field: "code", message: attemptsLeft(failure.attemptsRemaining) };
    if (failure.status === HTTP_STATUS.tooManyRequests) return { ...rateLimitProblem(failure.retryAfter), links: MFA_COPY.restart };
    return requestFailure(failure);
}
