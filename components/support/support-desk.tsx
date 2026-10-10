"use client";
import { useId } from "react";
import TicketForm from "@/components/support/ticket-form";
import TicketReceipt from "@/components/support/ticket-receipt";
import ErrorSummary from "@/components/common/error-summary";
import HudPanel from "@/components/common/hud-panel";
import { problemCount } from "@/lib/auth/problems";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { useTicketFlow } from "@/lib/hooks/use-ticket-flow";
import type { ContextLine, SupportContext, TicketDraft, TicketField } from "@/lib/types";

interface Props {
    replyTo: string | null;
    context: SupportContext;
    prefill: Pick<TicketDraft, "subject" | "category">;
    lines: readonly ContextLine[];
}

const { panel } = SUPPORT_COPY;

export default function SupportDesk({ replyTo, context, prefill, lines }: Props) {
    const flow = useTicketFlow({ replyTo, context, prefill });
    const baseId = useId();
    const idOf = (field: TicketField) => `${baseId}-${field}`;

    return (
        <HudPanel label={panel.label} status={flow.receipt ? panel.sent : panel.status} note={panel.note}>
            {flow.receipt ? (
                <TicketReceipt receipt={flow.receipt} onAgain={flow.again} />
            ) : (
                <>
                    <ErrorSummary
                        problems={flow.problems}
                        attempt={flow.attempt}
                        heading={AUTH_COPY.summary.heading}
                        count={problemCount(flow.problems.length)}
                        fieldId={idOf}
                    />
                    <TicketForm
                        idOf={idOf}
                        values={flow.values}
                        errorFor={flow.errorFor}
                        anonymous={replyTo === null}
                        lines={lines}
                        saved={flow.saved}
                        pending={flow.pending}
                        onSet={flow.set}
                        onSubmit={flow.submit}
                    />
                </>
            )}
        </HudPanel>
    );
}
