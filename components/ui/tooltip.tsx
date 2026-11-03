"use client";
import type { ReactNode } from "react";
import { Tooltip as AriaTooltip, TooltipTrigger, type TooltipProps } from "react-aria-components";
import { TOOLTIP_DELAY } from "@/lib/ui/constants";

interface Props {
    content: string;
    placement?: TooltipProps["placement"];
    children: ReactNode;
}

export default function Tooltip({ content, placement = "top", children }: Props) {
    return (
        <TooltipTrigger delay={TOOLTIP_DELAY.open} closeDelay={TOOLTIP_DELAY.close}>
            {children}
            <AriaTooltip
                placement={placement}
                offset={6}
                className="haulr-label border-border-dark bg-background-muted text-text z-(--z-indices-tooltip) max-w-64 border px-2 py-1 data-entering:haulr-fade-in data-exiting:haulr-fade-out"
            >
                {content}
            </AriaTooltip>
        </TooltipTrigger>
    );
}
