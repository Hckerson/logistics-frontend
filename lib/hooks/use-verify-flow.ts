import { useEffect, useEffectEvent, useRef, useState } from "react";
import { resendFailure, VERIFY_SIGNAL, verifyOutcome } from "@/lib/auth/verify";
import { requestFailure } from "@/lib/auth/problems";
import { HTTP_STATUS } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useResendVerification } from "@/lib/hooks/use-resend-verification";
import { useVerifyEmail } from "@/lib/hooks/use-verify-email";
import type { VerifyStatus } from "@/lib/types";

const network = { message: AUTH_COPY.errors.network };

export function useVerifyFlow(token: string | null, sessionEmail: string | null) {
    const checks = useFormProblems();
    const verify = useVerifyEmail();
    const resend = useResendVerification();
    const started = useRef(false);
    const [status, setStatus] = useState<VerifyStatus>(token ? "verifying" : "inbox");
    const [email, setEmail] = useState(sessionEmail);
    const [sentAt, setSentAt] = useState<number | null>(() => (token ? null : performance.now()));
    const [resent, setResent] = useState(false);

    const check = () => {
        if (!token) return;
        verify.mutate(token, {
            onSuccess: (result) => {
                if (result.ok) {
                    setEmail(result.data);
                    return setStatus("verified");
                }
                const outcome = verifyOutcome(result);
                setStatus(outcome);
                if (outcome === "failed") checks.fail([requestFailure(result)]);
            },
            onError: () => {
                setStatus("failed");
                checks.fail([network]);
            },
        });
    };

    const onOpen = useEffectEvent(check);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        onOpen();
    }, []);

    const retry = () => {
        if (verify.isPending) return;
        checks.reset();
        setStatus("verifying");
        check();
    };

    const send = () => {
        if (resend.isPending) return;
        resend.mutate(undefined, {
            onSuccess: (result) => {
                if (!result.ok && result.status === HTTP_STATUS.conflict) return setStatus("already");
                if (!result.ok) return checks.fail([resendFailure(result)]);
                checks.reset();
                setResent(status === "inbox");
                setSentAt(performance.now());
                setStatus("inbox");
            },
            onError: () => checks.fail([network]),
        });
    };

    const signal = checks.problems.length > 0 ? "held" : VERIFY_SIGNAL[status];

    return { ...checks, status, email, sentAt, resent, retry, send, sending: resend.isPending, signal };
}
