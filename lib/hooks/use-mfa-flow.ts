import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { mfaFailure, mfaProblems } from "@/lib/auth/mfa";
import { flowSignal } from "@/lib/auth/signal";
import { HTTP_STATUS, MFA_CODE_LENGTH } from "@/lib/constants";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useMfaChallenge } from "@/lib/hooks/use-mfa-challenge";
import type { MfaMethod } from "@/lib/types";

const EMPTY: Record<MfaMethod, string> = { totp: "", backup: "" };
const NOT_DIGIT = /\D/g;

export function useMfaFlow(next: string, open: boolean) {
    const router = useRouter();
    const checks = useFormProblems();
    const answer = useMfaChallenge();
    const [method, setMethod] = useState<MfaMethod>("totp");
    const [values, setValues] = useState(EMPTY);
    const [expired, setExpired] = useState(!open);
    const [locked, setLocked] = useState(false);
    const [arrived, setArrived] = useState(false);
    const busy = answer.isPending || arrived || locked;

    const send = (code: string) => {
        if (busy) return;
        const issues = mfaProblems(method, code);
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        answer.mutate(
            { method, code },
            {
                onSuccess: (result) => {
                    if (result.ok) {
                        setArrived(true);
                        router.push(next);
                        return router.refresh();
                    }
                    if (result.status === HTTP_STATUS.notFound) return setExpired(true);
                    if (result.status === HTTP_STATUS.tooManyRequests) setLocked(true);
                    setValues(EMPTY);
                    checks.fail([mfaFailure(result)]);
                },
                onError: () => checks.fail([{ message: ERROR_COPY.offline }]),
            },
        );
    };

    const update = (event: ChangeEvent<HTMLInputElement>) => {
        const typed = event.target.value;
        const value = method === "totp" ? typed.replace(NOT_DIGIT, "").slice(0, MFA_CODE_LENGTH) : typed;
        setValues((current) => ({ ...current, [method]: value }));
        checks.clear("code");
        if (method === "totp" && value.length === MFA_CODE_LENGTH) send(value);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        send(values[method]);
    };

    const toggle = () => {
        checks.reset();
        setMethod((current) => (current === "totp" ? "backup" : "totp"));
    };

    const signal = flowSignal({
        done: arrived,
        pending: answer.isPending,
        first: false,
        held: checks.problems.length > 0 || locked,
    });

    return {
        ...checks,
        method,
        value: values[method],
        expired,
        locked,
        arrived,
        pending: answer.isPending,
        update,
        submit,
        toggle,
        signal,
        step: expired ? "expired" : method,
    };
}
