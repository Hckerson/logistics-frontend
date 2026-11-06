"use client";
import { Close } from "@carbon/icons-react";
import { Button as AriaButton } from "react-aria-components";
import { FOCUS_RING } from "@/lib/ui/constants";

interface Props {
    label: string;
    removeLabel: string;
    onRemove: () => void;
}

export default function FilterChip({ label, removeLabel, onRemove }: Props) {
    return (
        <span className="border-border-dark bg-background-muted/60 text-text-secondary haulr-fade-in inline-flex h-7 max-w-full items-center gap-1 border pl-2.5 text-xs">
            <span className="truncate">{label}</span>
            <AriaButton
                aria-label={removeLabel}
                onPress={onRemove}
                className={`${FOCUS_RING} text-text-muted hover:text-text grid size-6 shrink-0 cursor-pointer place-items-center outline-none transition-colors`}
            >
                <Close aria-hidden className="size-3.5" />
            </AriaButton>
        </span>
    );
}
