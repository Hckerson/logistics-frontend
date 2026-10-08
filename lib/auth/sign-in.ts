import { isAxiosError } from "axios";
import type { Credentials, FormProblem, SignInField } from "@/lib/types";
import { issuesToProblems, rateLimitProblem } from "@/lib/auth/problems";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { signInSchema } from "@/lib/validations/auth";

const { errors } = SIGN_IN_COPY;

export function signInProblems(credentials: Credentials): FormProblem[] {
    const result = signInSchema.safeParse(credentials);
    return result.success ? [] : issuesToProblems<SignInField>(result.error.issues, errors);
}

export function failureProblem(error: unknown): FormProblem {
    if (!isAxiosError(error) || !error.response) return { message: AUTH_COPY.errors.network };
    const { status, headers } = error.response;
    if (status === 429) return rateLimitProblem(headers["retry-after"]);
    return { message: status < 500 ? errors.credentials : AUTH_COPY.errors.network };
}
