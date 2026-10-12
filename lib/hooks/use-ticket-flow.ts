import { useState, type FormEvent } from "react";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { useCreateTicket } from "@/lib/hooks/use-create-ticket";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useTicketDraft } from "@/lib/hooks/use-ticket-draft";
import { draftStore } from "@/lib/support/draft";
import { ticketFailure, ticketProblems } from "@/lib/support/problems";
import type { SupportContext, TicketDraft, TicketDraftField, TicketField, TicketReceipt } from "@/lib/types";

interface Options {
    replyTo: string | null;
    context: SupportContext;
    prefill: Pick<TicketDraft, "subject" | "category">;
}

export function useTicketFlow({ replyTo, context, prefill }: Options) {
    const draft = useTicketDraft();
    const checks = useFormProblems<TicketField>();
    const create = useCreateTicket();
    const announce = useAnnounce();
    const [receipt, setReceipt] = useState<(TicketReceipt & { email: string }) | null>(null);
    const values: TicketDraft = {
        ...draft,
        subject: draft.subject || prefill.subject,
        category: draft.category ?? prefill.category,
    };

    const set = <K extends TicketDraftField>(field: K, value: TicketDraft[K]) => {
        draftStore.save({ ...values, [field]: value });
        checks.clear(field);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (create.isPending) return;
        const issues = ticketProblems(values, replyTo === null);
        const { category, urgency, subject, description, load, email, key } = values;
        if (issues.length > 0 || !category || !urgency) return checks.fail(issues);
        checks.reset();
        create.mutate(
            { category, urgency, subject, description, load, email, key, context },
            {
                onSuccess: (result) => {
                    if (!result.ok) return checks.fail([ticketFailure(result)]);
                    setReceipt({ ...result.data, email: replyTo ?? email });
                    draftStore.clear();
                    announce({ message: SUPPORT_COPY.receipt.announced.replace("{reference}", result.data.reference) });
                },
                onError: () => checks.fail([{ message: SUPPORT_COPY.errors.failed }]),
            },
        );
    };

    return {
        ...checks,
        values,
        set,
        submit,
        receipt,
        again: () => setReceipt(null),
        pending: create.isPending,
        saved: draft.savedAt !== "",
    };
}
