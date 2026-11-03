"use client";
import clsx from "clsx";
import { useId } from "react";
import { Calendar } from "@carbon/icons-react";
import { Button as AriaButton, DateInput, DatePicker, DateSegment, Dialog, Group, type DateValue } from "react-aria-components";
import CalendarPanel from "@/components/ui/calendar-panel";
import FocusCorners from "@/components/ui/focus-corners";
import Popover from "@/components/ui/popover";
import { describedBy, fieldClass, squareButtonClass } from "@/lib/ui/classes";
import { ICON_SIZES, LABEL_TEXT, UI_COPY } from "@/lib/ui/constants";
import { fromDateValue, toDateValue, zoneLabel } from "@/lib/utils/date-value";
import type { ControlSize } from "@/lib/types";

interface Props {
    id?: string;
    name?: string;
    value: string | null;
    onChange: (value: string | null) => void;
    timeZone: string;
    granularity?: "day" | "minute";
    min?: string;
    max?: string;
    size?: ControlSize;
    invalid?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
}

const SEGMENT = [
    "text-text px-px tabular-nums outline-none caret-transparent",
    "data-placeholder:text-text-muted data-[type=literal]:text-text-muted data-[type=literal]:px-0",
    "data-focused:bg-accent/20 data-focused:text-text data-invalid:text-error",
].join(" ");

export default function DateField(props: Props) {
    const { id, name, value, onChange, timeZone, granularity = "day", min, max, size = "md", invalid = false } = props;
    const zoneId = useId();
    const withTime = granularity === "minute";

    return (
        <DatePicker<DateValue>
            id={id}
            name={name}
            value={toDateValue(value, timeZone, withTime)}
            onChange={(next) => onChange(fromDateValue(next, timeZone))}
            minValue={toDateValue(min, timeZone, withTime)}
            maxValue={toDateValue(max, timeZone, withTime)}
            granularity={granularity}
            hideTimeZone
            shouldForceLeadingZeros
            isInvalid={invalid}
            isDisabled={props.isDisabled}
            isReadOnly={props.isReadOnly}
            isRequired={props.isRequired}
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            aria-describedby={describedBy(props["aria-describedby"], zoneId)}
            className="flex min-w-0 items-center gap-3"
        >
            <Group className={fieldClass(size, invalid, "pr-0.5 data-disabled:opacity-40")}>
                <DateInput className="flex flex-1 items-center font-mono">
                    {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
                </DateInput>
                <AriaButton aria-label={UI_COPY.chooseDate} className={squareButtonClass("ghost", size === "lg" || size === "xl" ? "md" : "sm")}>
                    <Calendar aria-hidden className={clsx(ICON_SIZES[size], "text-text-muted")} />
                </AriaButton>
                <FocusCorners invalid={invalid} />
            </Group>
            <span id={zoneId} className={clsx(LABEL_TEXT, "shrink-0")}>
                {zoneLabel(timeZone)}
            </span>
            <Popover placement="bottom start">
                <Dialog className="p-3 outline-none">
                    <CalendarPanel />
                </Dialog>
            </Popover>
        </DatePicker>
    );
}
