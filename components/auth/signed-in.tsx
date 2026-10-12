"use client";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import AuthIntro from "@/components/auth/auth-intro";
import AuthSubmit from "@/components/auth/auth-submit";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { LOGIN_ROUTE } from "@/lib/constants";
import { HOLDING_COPY } from "@/lib/data/auth/dashboard";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useLogout } from "@/lib/hooks/use-logout";

interface Props {
    footer: ReactNode;
}

const { outcome } = HOLDING_COPY;

export default function SignedIn({ footer }: Props) {
    const user = useSession();
    const router = useRouter();
    const logout = useLogout();
    const announce = useAnnounce();
    const checks = useFormProblems();

    const signOut = (event: FormEvent) => {
        event.preventDefault();
        if (logout.isPending) return;
        checks.reset();
        logout.mutate(undefined, {
            onSuccess: () => {
                announce({ message: HOLDING_COPY.signedOut });
                router.push(LOGIN_ROUTE);
                router.refresh();
            },
            onError: () => checks.fail([{ message: ERROR_COPY.offline }]),
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
                <OutcomeStep label={outcome.label} detail={user?.email} body={outcome.body}>
                    <form onSubmit={signOut}>
                        <AuthSubmit label={HOLDING_COPY.signOut} pendingLabel={HOLDING_COPY.pending} pending={logout.isPending} />
                    </form>
                </OutcomeStep>
            </FlowPanel>
        </>
    );
}
