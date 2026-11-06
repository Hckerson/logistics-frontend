"use client";
import { useState } from "react";
import CancellationTerms from "@/components/common/cancellation-terms";
import ReasonDialog from "@/components/common/reason-dialog";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import type { ActionFailure, LoadAction } from "@/lib/types";

interface Props {
    load: LoadDto;
    action: LoadAction | null;
    pending: boolean;
    failure: ActionFailure | null;
    onClose: () => void;
    onConfirm: (reason: string | undefined) => void;
}

const { actions: copy } = LOAD_COPY;

export default function LoadActionDialog({ load, action, pending, failure, onClose, onConfirm }: Props) {
    const [checking, setChecking] = useState(action?.to === "Cancelled");

    return (
        <ReasonDialog
            isOpen={action !== null}
            kicker={load.id}
            title={action?.label ?? ""}
            consequence={action?.consequence ?? ""}
            confirmLabel={action?.label ?? ""}
            cancelLabel={copy.back}
            needsReason={Boolean(action?.reason)}
            pending={pending || checking}
            failure={failure}
            destructive={action?.destructive}
            onClose={onClose}
            onConfirm={onConfirm}
        >
            {action?.to === "Cancelled" ? <CancellationTerms load={load} onSettled={() => setChecking(false)} /> : null}
            {action?.penalty ? <p className="text-signal-warning text-xs">{copy.penalty}</p> : null}
        </ReasonDialog>
    );
}
