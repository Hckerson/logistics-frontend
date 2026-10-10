"use client";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import AuthIntro from "@/components/auth/auth-intro";
import AuthSubmit from "@/components/auth/auth-submit";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import { LOGIN_ROUTE } from "@/lib/constants";
import { HOLDING_COPY } from "@/lib/data/auth/dashboard";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useLogout } from "@/lib/hooks/use-logout";

interface Props {
    email: string;
    footer: ReactNode;
}

const { outcome } = HOLDING_COPY;

export default function SignedIn({ email, footer }: Props) {
    const router = useRouter();
    const logout = useLogout();
    const checks = useFormProblems();

    const signOut = (event: FormEvent) => {
        event.preventDefault();
        if (logout.isPending) return;
        checks.reset();
        logout.mutate(undefined, {
            onSuccess: () => {
                router.push(LOGIN_ROUTE);
                router.refresh();
            },
            onError: () => checks.fail([{ message: AUTH_COPY.errors.network }]),
        });
    };

    return (
        <>
            <AuthIntro title={HOLDING_COPY.title} lead={HOLDING_COPY.lead} />
            <FlowPanel
                label={HOLDING_COPY.label}
                status={HOLDING_COPY.status}
                signal={checks.problems.length > 0 ? "held" : "arrived"}
                problems={checks.problems}
                attempt={checks.attempt}
                fieldId={(field) => field}
                step="signed-in"
                footer={footer}
            >
                <OutcomeStep label={outcome.label} detail={email} body={outcome.body}>
                    <form onSubmit={signOut}>
                        <AuthSubmit label={HOLDING_COPY.signOut} pendingLabel={HOLDING_COPY.pending} pending={logout.isPending} />
                    </form>
                </OutcomeStep>
            </FlowPanel>
        </>
    );
}
