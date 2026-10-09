import type { ActionFailure, FormProblem, ResetField } from "@/lib/types";
import { issuesToProblems, requestFailure } from "@/lib/auth/problems";
import { HTTP_STATUS } from "@/lib/constants";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { RESET_COPY } from "@/lib/data/auth/reset";
import { newPasswordSchema, resetRequestSchema } from "@/lib/validations/auth";

export function resetProblems(email: string): FormProblem[] {
    const result = resetRequestSchema.safeParse({ email });
    return result.success ? [] : issuesToProblems<"email">(result.error.issues, FORGOT_COPY.errors);
}

export function newPasswordProblems(values: Record<ResetField, string>): FormProblem[] {
    const result = newPasswordSchema.safeParse(values);
    return result.success ? [] : issuesToProblems<ResetField>(result.error.issues, RESET_COPY.errors);
}

export function saveFailure(failure: ActionFailure): FormProblem {
    if (failure.status === HTTP_STATUS.notFound) return RESET_COPY.dead;
    if (failure.status === HTTP_STATUS.unprocessable) return { field: "password", message: RESET_COPY.errors.password.breached };
    return requestFailure(failure);
}
