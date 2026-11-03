"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Popover as AriaPopover, type PopoverProps } from "react-aria-components";
import HudCorners from "@/components/ui/hud-corners";
import { OVERLAY_HEADER, OVERLAY_SURFACE } from "@/lib/ui/constants";

interface Props extends Omit<PopoverProps, "className" | "children" | "style"> {
    label?: string;
    className?: string;
    children: ReactNode;
}

export default function Popover({ label, className, children, offset = 6, ...rest }: Props) {
    return (
        <AriaPopover {...rest} offset={offset} className={clsx(OVERLAY_SURFACE, "flex flex-col", className)}>
            <HudCorners />
            {label ? <p className={OVERLAY_HEADER}>{label}</p> : null}
            {children}
        </AriaPopover>
    );
}
