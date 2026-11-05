"use client";
import clsx from "clsx";
import { Calendar } from "@carbon/icons-react";
import { Button as AriaButton } from "react-aria-components";
import { squareButtonClass } from "@/lib/ui/classes";
import { ICON_SIZES } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import type { ControlSize } from "@/lib/types";

interface Props {
    size: ControlSize;
}

export default function CalendarButton({ size }: Props) {
    return (
        <AriaButton aria-label={UI_COPY.chooseDate} className={squareButtonClass("ghost", size === "lg" || size === "xl" ? "md" : "sm")}>
            <Calendar aria-hidden className={clsx(ICON_SIZES[size], "text-text-muted")} />
        </AriaButton>
    );
}
