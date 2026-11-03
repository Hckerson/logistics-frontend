"use client";
import clsx from "clsx";
import { useId } from "react";
import { Label, Radio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import FieldError, { fieldErrorId } from "@/components/ui/field-error";
import type { ChoiceOption } from "@/lib/types";

interface Props<T extends string> {
    legend: string;
    options: readonly ChoiceOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
    id?: string;
    index?: string;
    name?: string;
    columns?: 1 | 2 | 3;
    error?: string;
    isDisabled?: boolean;
    className?: string;
}

const COLUMNS = {
    1: "",
    2: "sm:grid-cols-2",
    3: "grid-cols-3",
} as const;

export default function RadioGroup<T extends string>(props: Props<T>) {
    const { legend, options, value, onChange, id, index, name, columns = 1, error, isDisabled, className } = props;
    const fallbackId = useId();
    const groupId = id ?? fallbackId;

    const select = (key: string) => {
        const option = options.find((item) => item.value === key);
        if (option) onChange(option.value);
    };

    return (
        <AriaRadioGroup
            id={groupId}
            name={name}
            value={value}
            onChange={select}
            isDisabled={isDisabled}
            isInvalid={Boolean(error)}
            aria-describedby={error ? fieldErrorId(groupId) : undefined}
            className={clsx("flex flex-col", className)}
        >
            <Label className={clsx("haulr-label mb-2 flex items-baseline gap-2.5", error ? "text-error" : "text-text-muted")}>
                {index ? <span>{index}</span> : null}
                {legend}
            </Label>
            <div className={clsx("grid gap-1", COLUMNS[columns])}>
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        value={option.value}
                        isDisabled={option.disabledReason !== undefined}
                        className={({ isSelected, isFocusVisible, isDisabled: off }) =>
                            clsx(
                                "flex cursor-pointer flex-col gap-0.5 border-l-2 px-3 py-2 text-xs transition-colors",
                                isSelected
                                    ? "border-accent bg-background-muted text-text"
                                    : "border-border bg-background-muted/40 text-text-secondary hover:text-text",
                                isFocusVisible && "outline-text outline-2",
                                off && "cursor-not-allowed opacity-40",
                            )
                        }
                    >
                        <span>{option.label}</span>
                        {(option.disabledReason ?? option.detail) ? (
                            <span className="text-text-muted">{option.disabledReason ?? option.detail}</span>
                        ) : null}
                    </Radio>
                ))}
            </div>
            {error ? (
                <div className="mt-2">
                    <FieldError id={groupId} message={error} />
                </div>
            ) : null}
        </AriaRadioGroup>
    );
}
