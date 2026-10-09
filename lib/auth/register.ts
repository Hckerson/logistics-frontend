import { isAxiosError } from "axios";
import { z } from "zod";
import type { AccountDraft, AccountField, FormProblem } from "@/lib/types";
import { issuesToProblems, rateLimitProblem } from "@/lib/auth/problems";
import { SESSION_UNAVAILABLE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { accountSchema } from "@/lib/validations/auth";

const { errors } = REGISTER_COPY;
const CONFLICT = 409;
const messageBody = z.object({ message: z.string() });

export function accountProblems(draft: AccountDraft, fields: readonly AccountField[]): FormProblem[] {
    const result = accountSchema.safeParse(draft);
    if (result.success) return [];
    return issuesToProblems<AccountField>(result.error.issues, errors).filter(
        (problem) => problem.field && fields.includes(problem.field),
    );
}

export function registerFailure(error: unknown): FormProblem {
    if (!isAxiosError(error) || !error.response) return { message: AUTH_COPY.errors.network };
    const { status, headers, data } = error.response;
    if (status === 429) return rateLimitProblem(headers["retry-after"]);
    if (status === CONFLICT) return { field: "email", message: errors.conflict, links: REGISTER_COPY.conflictLinks };
    if (messageBody.safeParse(data).data?.message === SESSION_UNAVAILABLE) {
        return { message: errors.session, links: REGISTER_COPY.sessionLinks };
    }
    return { message: status < 500 ? errors.rejected : AUTH_COPY.errors.network };
}
