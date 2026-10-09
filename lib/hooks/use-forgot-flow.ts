import { useState, type ChangeEvent, type FormEvent } from "react";
import { requestFailure } from "@/lib/auth/problems";
import { resetProblems } from "@/lib/auth/reset";
import { flowSignal } from "@/lib/auth/signal";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useRequestPasswordReset } from "@/lib/hooks/use-request-password-reset";
import type { ResetStep } from "@/lib/types";

export function useForgotFlow() {
    const checks = useFormProblems();
    const request = useRequestPasswordReset();
    const [email, setEmail] = useState("");
    const [sentAt, setSentAt] = useState<number | null>(null);
    const [resent, setResent] = useState(false);

    const update = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        checks.clear("email");
    };

    const send = (again: boolean) =>
        request.mutate(email.trim(), {
            onSuccess: (result) => {
                if (!result.ok) return checks.fail([requestFailure(result)]);
                checks.reset();
                setSentAt(performance.now());
                setResent(again);
            },
            onError: () => checks.fail([{ message: AUTH_COPY.errors.network }]),
        });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (request.isPending) return;
        const issues = resetProblems(email);
        if (issues.length > 0) return checks.fail(issues);
        send(false);
    };

    const resend = () => {
        if (!request.isPending) send(true);
    };

    const step: ResetStep = sentAt === null ? "email" : "sent";
    const signal = flowSignal({
        done: step === "sent" && !request.isPending,
        pending: request.isPending,
        first: step === "email",
        held: checks.problems.length > 0,
    });

    return { ...checks, step, email, sentAt, resent, update, submit, resend, pending: request.isPending, signal };
}
