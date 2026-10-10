import type { ActionFailure, FormProblem, TicketDraft, TicketField } from "@/lib/types";
import { issuesToProblems, rateLimitProblem } from "@/lib/auth/problems";
import { HTTP_STATUS } from "@/lib/constants";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { ticketContactSchema, ticketFormSchema } from "@/lib/validations/support";

const { errors } = SUPPORT_COPY;

export function ticketProblems(values: TicketDraft, anonymous: boolean): FormProblem<TicketField>[] {
    const form = ticketFormSchema.safeParse(values);
    const contact = ticketContactSchema.safeParse(values);
    return [
        ...(form.success ? [] : issuesToProblems<TicketField>(form.error.issues, errors.fields)),
        ...(anonymous && !contact.success ? issuesToProblems<TicketField>(contact.error.issues, errors.fields) : []),
    ];
}

export const ticketFailure = ({ status, retryAfter }: ActionFailure): FormProblem<TicketField> =>
    status === HTTP_STATUS.tooManyRequests ? rateLimitProblem(retryAfter) : { message: errors.failed };
