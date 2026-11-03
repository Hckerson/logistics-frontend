"use client";
import clsx from "clsx";
import { useId } from "react";
import { SelectionIndicator, ToggleButton, ToggleButtonGroup, type Key } from "react-aria-components";
import type { ChoiceOption } from "@/lib/types";

type SegmentSize = "sm" | "md";

interface Props<T extends string> {
    label: string;
    options: readonly ChoiceOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: SegmentSize;
    className?: string;
}

const ITEM_SIZES: Record<SegmentSize, string> = {
    sm: "h-6 px-2.5",
    md: "h-8 px-3",
};

const ITEM = [
    "text-text-muted relative flex cursor-pointer items-center justify-center text-xs whitespace-nowrap outline-none transition-colors",
    "hover:text-text data-selected:text-text data-disabled:cursor-not-allowed data-disabled:opacity-40",
    "data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2",
].join(" ");

const INDICATOR =
    "bg-background absolute top-0 left-0 h-full w-full transition-[translate,width] duration-300 ease-(--haulr-ease) motion-reduce:transition-none";

export default function SegmentedControl<T extends string>({ label, options, value, onChange, size = "md", className }: Props<T>) {
    const baseId = useId();
    const reasonId = (option: T) => `${baseId}-${option}-reason`;

    const select = (keys: Set<Key>) => {
        const option = options.find((item) => keys.has(item.value));
        if (option) onChange(option.value);
    };

    return (
        <ToggleButtonGroup
            aria-label={label}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[value]}
            onSelectionChange={select}
            className={clsx("bg-background-muted inline-flex max-w-full overflow-x-auto p-0.5", className)}
        >
            {options.map((option) => (
                <ToggleButton
                    key={option.value}
                    id={option.value}
                    isDisabled={option.disabledReason !== undefined}
                    aria-describedby={option.disabledReason === undefined ? undefined : reasonId(option.value)}
                    className={clsx(ITEM, ITEM_SIZES[size])}
                >
                    <SelectionIndicator className={INDICATOR} />
                    <span className="relative">{option.label}</span>
                    {option.disabledReason === undefined ? null : (
                        <span id={reasonId(option.value)} hidden>
                            {option.disabledReason}
                        </span>
                    )}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
