"use client";
import type { ReactNode } from "react";
import { WarningFilled } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    consequence: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    pending?: boolean;
    destructive?: boolean;
    error?: string;
    kicker?: string;
    children?: ReactNode;
}

export default function ConfirmDialog(props: Props) {
    const { isOpen, onOpenChange, title, consequence, confirmLabel, cancelLabel, onConfirm } = props;
    const { pending = false, destructive = false, error, kicker, children } = props;

    const change = (open: boolean) => {
        if (!pending) onOpenChange(open);
    };

    return (
        <Dialog
            role="alertdialog"
            isOpen={isOpen}
            onOpenChange={change}
            title={title}
            kicker={kicker}
            description={consequence}
            dismissable={!pending}
            width="sm"
            footer={
                <>
                    <Button tone="ghost" isDisabled={pending} onPress={() => change(false)}>
                        {cancelLabel}
                    </Button>
                    <Button tone={destructive ? "danger" : "ink"} pending={pending} onPress={onConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {children}
            {error ? (
                <p role="alert" className="text-error flex items-start gap-1.5">
                    <WarningFilled aria-hidden className="mt-px size-3.5 shrink-0" />
                    {error}
                </p>
            ) : null}
        </Dialog>
    );
}
