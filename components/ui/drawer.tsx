"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Dialog as AriaDialog, Modal, ModalOverlay } from "react-aria-components";
import { OVERLAY_BACKDROP } from "@/lib/ui/constants";
import DialogHeader from "@/components/ui/dialog-header";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    kicker?: string;
    side?: "left" | "right";
    width?: "sm" | "md";
    footer?: ReactNode;
    children: ReactNode;
}

const WIDTHS = {
    sm: "w-[min(20rem,85vw)]",
    md: "w-[min(28rem,92vw)]",
} as const;

const SIDES = {
    left: "left-0 border-r",
    right: "right-0 border-l",
} as const;

export default function Drawer({ isOpen, onOpenChange, title, kicker, side = "left", width = "sm", footer, children }: Props) {
    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className={OVERLAY_BACKDROP}>
            <Modal
                className={clsx(
                    "border-border/70 bg-background fixed inset-y-0 flex flex-col outline-none data-entering:haulr-open",
                    SIDES[side],
                    WIDTHS[width],
                )}
            >
                <AriaDialog className="flex h-full min-h-0 flex-col outline-none">
                    <DialogHeader title={title} kicker={kicker} closable onClose={() => onOpenChange(false)} />
                    <div className="text-text-secondary min-h-0 flex-1 overflow-y-auto text-xs">{children}</div>
                    {footer ? <footer className="border-border shrink-0 border-t px-4 py-3">{footer}</footer> : null}
                </AriaDialog>
            </Modal>
        </ModalOverlay>
    );
}
