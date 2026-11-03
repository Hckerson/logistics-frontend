"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Checkmark, Subtract } from "@carbon/icons-react";
import { Checkbox as AriaCheckbox, type CheckboxProps } from "react-aria-components";

interface Props extends Omit<CheckboxProps, "children" | "className" | "style" | "isInvalid"> {
    invalid?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Checkbox({ invalid = false, className, children, ...rest }: Props) {
    return (
        <AriaCheckbox
            {...rest}
            isInvalid={invalid}
            className={clsx(
                "group/check text-text-secondary inline-flex cursor-pointer items-start gap-3 text-xs leading-relaxed",
                "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-readonly:cursor-default",
                className,
            )}
        >
            {({ isSelected, isIndeterminate }) => (
                <>
                    <span
                        aria-hidden
                        className={clsx(
                            "mt-0.5 grid size-4 shrink-0 place-items-center border transition-colors duration-200",
                            "group-data-focus-visible/check:outline-text group-data-focus-visible/check:outline-2 group-data-focus-visible/check:outline-offset-2",
                            isSelected || isIndeterminate ? "bg-text text-text-inverse" : "bg-background",
                            invalid
                                ? "border-error"
                                : isSelected || isIndeterminate
                                  ? "border-text"
                                  : "border-text-muted group-data-hovered/check:border-text",
                        )}
                    >
                        {isIndeterminate ? (
                            <Subtract className="size-3" />
                        ) : isSelected ? (
                            <Checkmark className="size-3" />
                        ) : null}
                    </span>
                    <span className="min-w-0">{children}</span>
                </>
            )}
        </AriaCheckbox>
    );
}
