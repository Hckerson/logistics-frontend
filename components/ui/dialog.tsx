"use client";
import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { Dialog as AriaDialog, Modal, ModalOverlay } from "react-aria-components";
import DialogHeader from "@/components/ui/dialog-header";
import HudCorners from "@/components/ui/hud-corners";
import { OVERLAY_BACKDROP } from "@/lib/ui/constants";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    kicker?: string;
    description?: string;
    dismissable?: boolean;
    width?: "sm" | "md";
    role?: "dialog" | "alertdialog";
    footer?: ReactNode;
    children?: ReactNode;
}

const WIDTHS = {
    sm: "max-w-sm",
    md: "max-w-lg",
} as const;

export default function Dialog(props: Props) {
    const { isOpen, onOpenChange, title, kicker, description, dismissable = true, width = "md", role = "dialog", footer, children } = props;
    const descriptionId = useId();

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={dismissable}
            isKeyboardDismissDisabled={!dismissable}
            className={clsx(OVERLAY_BACKDROP, "grid place-items-center p-4")}
        >
            <Modal className={clsx("border-border/70 bg-background relative w-full border outline-none data-entering:haulr-open", WIDTHS[width])}>
                <HudCorners />
                <AriaDialog
                    role={role}
                    aria-describedby={description ? descriptionId : undefined}
                    className="flex max-h-[85svh] flex-col outline-none"
                >
                    <DialogHeader title={title} kicker={kicker} closable={dismissable} onClose={() => onOpenChange(false)} />
                    <div className="text-text-secondary flex flex-col gap-3 overflow-y-auto p-4 text-xs leading-relaxed">
                        {description ? (
                            <p id={descriptionId} className="text-text">
                                {description}
                            </p>
                        ) : null}
                        {children}
                    </div>
                    {footer ? (
                        <footer className="border-border flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-4 py-3">
                            {footer}
                        </footer>
                    ) : null}
                </AriaDialog>
            </Modal>
        </ModalOverlay>
    );
}
