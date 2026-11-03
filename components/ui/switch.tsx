"use client";
import clsx from "clsx";
import { useId } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import ProgressLine from "@/components/ui/progress-line";

type SwitchSize = "sm" | "md";

interface Props {
    label: string;
    isSelected: boolean;
    onChange: (selected: boolean) => void;
    pending?: boolean;
    lockedReason?: string;
    size?: SwitchSize;
    name?: string;
    className?: string;
}

const TRACKS: Record<SwitchSize, string> = {
    sm: "h-3.5 w-7",
    md: "h-4 w-8",
};

const THUMBS: Record<SwitchSize, { size: string; on: string }> = {
    sm: { size: "size-2", on: "translate-x-3.5" },
    md: { size: "size-2.5", on: "translate-x-4" },
};

export default function Switch({ label, isSelected, onChange, pending = false, lockedReason, size = "md", name, className }: Props) {
    const reasonId = useId();
    const locked = lockedReason !== undefined;

    return (
        <div aria-busy={pending || undefined} className={clsx("flex flex-col gap-1", className)}>
            <AriaSwitch
                name={name}
                isSelected={isSelected}
                onChange={onChange}
                isReadOnly={locked || pending}
                aria-describedby={locked ? reasonId : undefined}
                className="group/switch text-text-secondary data-selected:text-text inline-flex cursor-pointer items-center gap-3 text-xs data-readonly:cursor-not-allowed"
            >
                <span
                    className={clsx(
                        "relative flex shrink-0 items-center border px-0.5 transition-colors duration-200",
                        "group-data-focus-visible/switch:outline-text group-data-focus-visible/switch:outline-2 group-data-focus-visible/switch:outline-offset-2",
                        TRACKS[size],
                        isSelected ? "border-accent bg-accent/15" : "border-border-dark bg-background-muted group-data-hovered/switch:border-text-muted",
                        locked && "opacity-40",
                    )}
                >
                    <span
                        className={clsx(
                            "block transition-[translate,background-color] duration-300 ease-(--haulr-ease)",
                            THUMBS[size].size,
                            isSelected ? clsx("bg-accent shadow-[0_0_10px_2px_var(--haulr-glow)]", THUMBS[size].on) : "bg-text-muted",
                        )}
                    />
                    {pending ? <ProgressLine className="absolute inset-x-0 -bottom-1.5" /> : null}
                </span>
                {label}
            </AriaSwitch>
            {locked ? (
                <p id={reasonId} className="text-text-muted text-xs">
                    {lockedReason}
                </p>
            ) : null}
        </div>
    );
}
