"use client";
import { useId, useState } from "react";
import CancellationTerms from "@/components/common/cancellation-terms";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { LOAD_REASON_MAX } from "@/lib/loads/constants";
import type { ActionFailure, LoadAction } from "@/lib/types";
import { errorMessage } from "@/lib/utils/action-result";

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
    const reasonId = useId();
    const [reason, setReason] = useState("");
    const [missing, setMissing] = useState(false);
    const [checking, setChecking] = useState(action?.to === "Cancelled");

    const confirm = () => {
        const text = reason.trim();
        if (action?.reason && !text) {
            setMissing(true);
            return;
        }
        onConfirm(text || undefined);
    };

    return (
        <ConfirmDialog
            isOpen={action !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            kicker={load.id}
            title={action?.label ?? ""}
            consequence={action?.consequence ?? ""}
            confirmLabel={action?.label ?? ""}
            cancelLabel={copy.back}
            onConfirm={confirm}
            pending={pending || checking}
            destructive={action?.destructive}
            error={failure ? errorMessage(failure) : undefined}
        >
            {action?.to === "Cancelled" ? <CancellationTerms load={load} onSettled={() => setChecking(false)} /> : null}
            {action?.penalty ? <p className="text-signal-warning text-xs">{copy.penalty}</p> : null}
            {action?.reason ? (
                <Field id={reasonId} label={copy.reason} hint={copy.reasonHint} error={missing ? copy.reasonMissing : undefined}>
                    {(control) => (
                        <Input
                            {...control}
                            value={reason}
                            maxLength={LOAD_REASON_MAX}
                            onChange={(event) => {
                                setReason(event.target.value);
                                setMissing(false);
                            }}
                        />
                    )}
                </Field>
            ) : null}
        </ConfirmDialog>
    );
}
