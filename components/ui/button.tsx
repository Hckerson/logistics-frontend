"use client";
import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import ProgressLine from "@/components/ui/progress-line";
import { buttonClass, describedBy } from "@/lib/ui/classes";
import { ICON_SIZES } from "@/lib/ui/constants";
import type { ButtonTone, ControlSize, IconGlyph } from "@/lib/types";

interface Props extends Omit<AriaButtonProps, "className" | "children" | "isPending" | "style"> {
    tone?: ButtonTone;
    size?: ControlSize;
    icon?: IconGlyph;
    trailing?: IconGlyph;
    pending?: boolean;
    pendingLabel?: string;
    disabledReason?: string;
    className?: string;
    children: ReactNode;
}

export default function Button(props: Props) {
    const { tone, size = "md", icon: Icon, trailing: Trailing, pending = false, pendingLabel, disabledReason, className, children, ...rest } = props;
    const { onPress, type = "button", "aria-describedby": described, ...native } = rest;
    const reasonId = useId();
    const explained = disabledReason !== undefined;

    return (
        <>
            <AriaButton
                {...native}
                type={explained ? "button" : type}
                isPending={pending}
                onPress={explained ? undefined : onPress}
                aria-disabled={explained || undefined}
                aria-describedby={describedBy(described, explained && reasonId)}
                className={buttonClass(tone, size, className)}
            >
                {Icon ? <Icon aria-hidden className={clsx(ICON_SIZES[size], "shrink-0")} /> : null}
                <span>{pending && pendingLabel ? pendingLabel : children}</span>
                {Trailing ? (
                    <Trailing
                        aria-hidden
                        className={clsx(ICON_SIZES[size], "shrink-0 transition-transform duration-300 group-hover:translate-x-0.5")}
                    />
                ) : null}
                {pending ? <ProgressLine className="bg-current/15 absolute inset-x-0 bottom-0" /> : null}
            </AriaButton>
            {explained ? (
                <span id={reasonId} hidden>
                    {disabledReason}
                </span>
            ) : null}
        </>
    );
}
