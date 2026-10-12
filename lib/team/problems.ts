import { issuesToProblems, requestFailure } from "@/lib/auth/problems";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { ACCEPT_REFUSAL } from "@/lib/team/constants";
import type { ActionFailure, FormProblem, Invitation, JoinDraft, JoinField } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { joinSchema } from "@/lib/validations/team";

const REFUSALS = ["gone", "accepted", "existing", "elsewhere", "sso", "mismatch"] as const satisfies readonly (keyof typeof ACCEPT_REFUSAL)[];

export function joinProblems(draft: JoinDraft): FormProblem<JoinField>[] {
    const result = joinSchema.safeParse(draft);
    return result.success ? [] : issuesToProblems<JoinField>(result.error.issues, INVITE_COPY.errors);
}

export function acceptProblem(failure: ActionFailure, invitation: Invitation): FormProblem<JoinField> {
    const refusal = REFUSALS.find((kind) => ACCEPT_REFUSAL[kind] === failure.message);
    if (!refusal) return requestFailure(failure);
    const { message, ...rest } = INVITE_COPY.refusals[refusal];
    return { ...rest, message: fillTemplate(message, { inviter: invitation.inviter, organisation: invitation.organisation }) };
}
