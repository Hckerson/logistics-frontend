"use client";
import { useId, useState, type ReactNode } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { LOAD_REASON_MAX } from "@/lib/loads/constants";
import type { ActionFailure } from "@/lib/types";
import { errorMessage } from "@/lib/utils/action-result";

interface Props {
    isOpen: boolean;
    kicker: string;
    title: string;
    consequence: string;
    confirmLabel: string;
    cancelLabel: string;
    needsReason: boolean;
    pending: boolean;
    failure: ActionFailure | null;
    destructive?: boolean;
    onClose: () => void;
    onConfirm: (reason: string | undefined) => void;
    children?: ReactNode;
}

const { reason: copy } = LOAD_RECORD_COPY;

export default function ReasonDialog(props: Props) {
    const { isOpen, kicker, title, consequence, confirmLabel, cancelLabel, needsReason, pending, failure, destructive, onClose, onConfirm, children } = props;
    const reasonId = useId();
    const [reason, setReason] = useState("");
    const [missing, setMissing] = useState(false);

    const confirm = () => {
        const text = reason.trim();
        if (needsReason && !text) {
            setMissing(true);
            return;
        }
        onConfirm(text || undefined);
    };

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            kicker={kicker}
            title={title}
            consequence={consequence}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={confirm}
            pending={pending}
            destructive={destructive}
            error={failure ? errorMessage(failure) : undefined}
        >
            {children}
            {needsReason ? (
                <Field id={reasonId} label={copy.label} hint={copy.hint} error={missing ? copy.missing : undefined}>
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
