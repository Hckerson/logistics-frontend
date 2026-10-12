import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { flowSignal } from "@/lib/auth/signal";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useAcceptInvitation } from "@/lib/hooks/use-accept-invitation";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { DRIVER_ROLE } from "@/lib/team/constants";
import { acceptProblem, joinProblems } from "@/lib/team/problems";
import type { Invitation, InviteStep, JoinDraft, JoinField } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

const EMPTY: JoinDraft = { fullName: "", password: "", consent: false };

export function useInviteFlow(token: string, invitation: Invitation) {
    const checks = useFormProblems<JoinField>();
    const accept = useAcceptInvitation();
    const announce = useAnnounce();
    const [draft, setDraft] = useState(EMPTY);
    const [step, setStep] = useState<InviteStep>("invite");
    const driver = invitation.role === DRIVER_ROLE;
    const values = { organisation: invitation.organisation, role: INVITE_COPY.roles[invitation.role] };

    const update = (field: JoinField) => (event: ChangeEvent<HTMLInputElement>) => {
        const value = field === "consent" ? event.target.checked : event.target.value;
        setDraft((current) => ({ ...current, [field]: value }));
        checks.clear(field);
    };

    const join = (newcomer?: { fullName: string; password: string }) =>
        accept.mutate(
            { token, newcomer },
            {
                onSuccess: (result) => {
                    if (!result.ok) return checks.fail([acceptProblem(result, invitation)]);
                    checks.reset();
                    announce({ message: fillTemplate(INVITE_COPY.states.done.body, values) });
                    setStep(driver ? "location" : "done");
                },
                onError: () => checks.fail([{ message: ERROR_COPY.offline }]),
            },
        );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (accept.isPending) return;
        const issues = joinProblems(draft);
        if (issues.length > 0) return checks.fail(issues);
        join({ fullName: draft.fullName.trim(), password: draft.password });
    };

    const confirm = (event: FormEvent) => {
        event.preventDefault();
        if (!accept.isPending) join();
    };

    const signal = flowSignal({
        done: step !== "invite",
        pending: accept.isPending,
        first: false,
        held: checks.problems.length > 0,
    });

    return { ...checks, draft, step, values, update, submit, confirm, pending: accept.isPending, signal };
}
