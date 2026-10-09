import type { ActionResult, FormProblem } from "@/lib/types";
import { issuesToProblems, rateLimitProblem } from "@/lib/auth/problems";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { resetRequestSchema } from "@/lib/validations/auth";

const RATE_LIMITED = 429;

type Failure = Extract<ActionResult<unknown>, { ok: false }>;

export function resetProblems(email: string): FormProblem[] {
    const result = resetRequestSchema.safeParse({ email });
    return result.success ? [] : issuesToProblems<"email">(result.error.issues, FORGOT_COPY.errors);
}

export const resetFailure = ({ status, retryAfter }: Failure): FormProblem =>
    status === RATE_LIMITED ? rateLimitProblem(retryAfter) : { message: AUTH_COPY.errors.network };
