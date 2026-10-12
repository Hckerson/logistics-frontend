import { isAxiosError } from "axios";
import { z } from "zod";
import type { AccountDraft, AccountField, FormProblem } from "@/lib/types";
import { issuesToProblems, rateLimitProblem, responseFailure } from "@/lib/auth/problems";
import { HTTP_STATUS, SESSION_UNAVAILABLE } from "@/lib/constants";
import { ERROR_COPY } from "@/lib/errors/constants";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { accountSchema } from "@/lib/validations/auth";

const { errors } = REGISTER_COPY;
const messageBody = z.object({ message: z.string() });

export function accountProblems(draft: AccountDraft, fields: readonly AccountField[]): FormProblem[] {
    const result = accountSchema.safeParse(draft);
    if (result.success) return [];
    return issuesToProblems<Exclude<AccountField, "confirm" | "code">>(result.error.issues, errors).filter(
        (problem) => problem.field && fields.includes(problem.field),
    );
}

export function registerFailure(error: unknown): FormProblem {
    if (!isAxiosError(error) || !error.response) return { message: ERROR_COPY.offline };
    const { status, headers, data } = error.response;
    if (status === HTTP_STATUS.tooManyRequests) return rateLimitProblem(headers["retry-after"]);
    if (status === HTTP_STATUS.conflict) return { field: "email", message: errors.conflict, links: REGISTER_COPY.conflictLinks };
    if (messageBody.safeParse(data).data?.message === SESSION_UNAVAILABLE) {
        return { message: errors.session, links: REGISTER_COPY.sessionLinks };
    }
    return status < HTTP_STATUS.serverError ? { message: errors.rejected } : responseFailure(status);
}
