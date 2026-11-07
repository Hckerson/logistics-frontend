"use client";
import clsx from "clsx";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { Checkmark, Subtract } from "@carbon/icons-react";
import { CHECK_BOX, CHECK_EDGE, CHECK_FILL } from "@/lib/ui/constants";

interface Props {
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean) => void;
    onArm?: (event: PointerEvent | KeyboardEvent) => void;
}

export default function TableCheck({ label, checked, indeterminate = false, onChange, onArm }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const on = checked || indeterminate;

    useEffect(() => {
        if (input.current) input.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
        <label onPointerDownCapture={onArm} onKeyDownCapture={onArm} className="group/check flex h-9 w-full cursor-pointer items-center pl-4">
            <input
                ref={input}
                type="checkbox"
                aria-label={label}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="peer sr-only"
            />
            <span
                aria-hidden
                className={clsx(
                    CHECK_BOX,
                    "peer-focus-visible:outline-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                    on ? clsx(CHECK_FILL.on, CHECK_EDGE.on) : clsx(CHECK_FILL.off, CHECK_EDGE.off, "group-hover/check:border-text"),
                )}
            >
                {indeterminate ? <Subtract className="size-3" /> : checked ? <Checkmark className="size-3" /> : null}
            </span>
        </label>
    );
}
