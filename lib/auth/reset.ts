import type { FormProblem } from "@/lib/types";
import { issuesToProblems } from "@/lib/auth/problems";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { resetRequestSchema } from "@/lib/validations/auth";

export function resetProblems(email: string): FormProblem[] {
    const result = resetRequestSchema.safeParse({ email });
    return result.success ? [] : issuesToProblems<"email">(result.error.issues, FORGOT_COPY.errors);
}
