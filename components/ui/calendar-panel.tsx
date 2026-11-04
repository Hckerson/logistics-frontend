"use client";
import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import {
    Button as AriaButton,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
} from "react-aria-components";
import { squareButtonClass } from "@/lib/ui/classes";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";

const CELL = [
    "text-text-secondary flex size-8 cursor-pointer items-center justify-center text-xs tabular-nums outline-none transition-colors",
    "data-hovered:bg-background-muted data-hovered:text-text data-today:shadow-[inset_0_0_0_1px_var(--colors-border-dark)]",
    "data-selected:bg-text data-selected:text-text-inverse data-outside-month:text-text-muted/40",
    "data-unavailable:text-text-muted data-unavailable:cursor-not-allowed data-unavailable:line-through",
    "data-disabled:text-text-muted/40 data-disabled:cursor-not-allowed",
    "data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2",
].join(" ");

export default function CalendarPanel() {
    return (
        <Calendar className="flex flex-col gap-2">
            <header className="flex items-center justify-between gap-2">
                <AriaButton slot="previous" aria-label={UI_COPY.previousMonth} className={squareButtonClass("ghost", "sm")}>
                    <ChevronLeft aria-hidden className="size-4" />
                </AriaButton>
                <CalendarHeading className="haulr-label text-text" />
                <AriaButton slot="next" aria-label={UI_COPY.nextMonth} className={squareButtonClass("ghost", "sm")}>
                    <ChevronRight aria-hidden className="size-4" />
                </AriaButton>
            </header>
            <CalendarGrid className="border-collapse">
                <CalendarGridHeader>
                    {(day) => <CalendarHeaderCell className={`${LABEL_TEXT} size-8 font-normal`}>{day}</CalendarHeaderCell>}
                </CalendarGridHeader>
                <CalendarGridBody>{(date) => <CalendarCell date={date} className={CELL} />}</CalendarGridBody>
            </CalendarGrid>
        </Calendar>
    );
}
