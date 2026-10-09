import { useState, type ChangeEvent, type FormEvent } from "react";
import { newPasswordProblems, saveFailure } from "@/lib/auth/reset";
import { flowSignal } from "@/lib/auth/signal";
import { HTTP_STATUS } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useResetPassword } from "@/lib/hooks/use-reset-password";
import type { ResetField } from "@/lib/types";

const EMPTY: Record<ResetField, string> = { password: "", confirm: "" };

export function useResetFlow(token: string) {
    const checks = useFormProblems();
    const save = useResetPassword();
    const [values, setValues] = useState(EMPTY);
    const [saved, setSaved] = useState(false);

    const update = (field: ResetField) => (event: ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
        checks.clear(field);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (save.isPending || saved) return;
        const issues = newPasswordProblems(values);
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        save.mutate(
            { token, password: values.password },
            {
                onSuccess: (result) => {
                    if (result.ok) return setSaved(true);
                    if (result.status === HTTP_STATUS.tooManyRequests) setValues(EMPTY);
                    checks.fail([saveFailure(result)]);
                },
                onError: () => checks.fail([{ message: AUTH_COPY.errors.network }]),
            },
        );
    };

    const signal = flowSignal({
        done: saved,
        pending: save.isPending,
        first: false,
        held: checks.problems.length > 0,
    });

    return { ...checks, step: saved ? "saved" : "password", values, update, submit, saved, pending: save.isPending, signal };
}
