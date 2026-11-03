"use client";
import { useId } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import ProgressLine from "@/components/ui/progress-line";
import Tooltip from "@/components/ui/tooltip";
import { describedBy, squareButtonClass } from "@/lib/ui/classes";
import { ICON_SIZES } from "@/lib/ui/constants";
import type { ButtonTone, ControlSize, IconGlyph } from "@/lib/types";

interface Props extends Omit<AriaButtonProps, "className" | "children" | "isPending" | "style" | "aria-label"> {
    label: string;
    icon: IconGlyph;
    tone?: ButtonTone;
    size?: ControlSize;
    pending?: boolean;
    disabledReason?: string;
    className?: string;
}

export default function IconButton(props: Props) {
    const { label, icon: Icon, tone = "ghost", size = "md", pending = false, disabledReason, className, ...rest } = props;
    const { onPress, type = "button", "aria-describedby": described, ...native } = rest;
    const reasonId = useId();
    const explained = disabledReason !== undefined;

    return (
        <>
            <Tooltip content={label}>
                <AriaButton
                    {...native}
                    aria-label={label}
                    type={explained ? "button" : type}
                    isPending={pending}
                    onPress={explained ? undefined : onPress}
                    aria-disabled={explained || undefined}
                    aria-describedby={describedBy(described, explained && reasonId)}
                    className={squareButtonClass(tone, size, className)}
                >
                    <Icon aria-hidden className={ICON_SIZES[size]} />
                    {pending ? <ProgressLine className="bg-current/15 absolute inset-x-0 bottom-0" /> : null}
                </AriaButton>
            </Tooltip>
            {explained ? (
                <span id={reasonId} hidden>
                    {disabledReason}
                </span>
            ) : null}
        </>
    );
}
