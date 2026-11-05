"use client";
import clsx from "clsx";
import { useId, useRef } from "react";
import { DateInput, DatePicker, DateSegment, Dialog, Group, type DateValue } from "react-aria-components";
import CalendarButton from "@/components/ui/calendar-button";
import CalendarPanel from "@/components/ui/calendar-panel";
import FocusCorners from "@/components/ui/focus-corners";
import Popover from "@/components/ui/popover";
import { describedBy, fieldClass } from "@/lib/ui/classes";
import { DATE_SEGMENT, LABEL_TEXT, MINUTE_STEP } from "@/lib/ui/constants";
import { fromDateValue, sameDate, snapToStep, toDateValue, zoneLabel } from "@/lib/utils/date-value";
import type { DateControl, DateTiming } from "@/lib/types";

type Props = DateTiming &
    DateControl & {
        name?: string;
        value: string | null;
        onChange: (value: string | null) => void;
    };

export default function DateField(props: Props) {
    const { id, name, value, onChange, min, max, size = "md", invalid = false, step = MINUTE_STEP } = props;
    const zoneId = useId();
    const picking = useRef(false);
    const zone = props.granularity === "minute" ? props.timeZone : null;
    const snap = (date: DateValue) => (zone && !props.isReadOnly ? snapToStep(date, zone, step) : date);

    const commit = () => {
        const current = toDateValue(value, zone);
        if (current && !sameDate(current, snap(current))) onChange(fromDateValue(snap(current), zone));
    };

    return (
        <DatePicker<DateValue>
            id={id}
            name={name}
            value={toDateValue(value, zone)}
            onChange={(next) => onChange(fromDateValue(next && picking.current ? snap(next) : next, zone))}
            onOpenChange={(open) => {
                picking.current = open;
            }}
            onBlur={commit}
            minValue={toDateValue(min, zone)}
            maxValue={toDateValue(max, zone)}
            granularity={zone ? "minute" : "day"}
            hideTimeZone
            shouldForceLeadingZeros
            isInvalid={invalid}
            isDisabled={props.isDisabled}
            isReadOnly={props.isReadOnly}
            isRequired={props.isRequired}
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            aria-describedby={describedBy(props["aria-describedby"], zone && zoneId)}
            className="flex min-w-0 items-center gap-3"
        >
            <Group className={fieldClass(size, invalid, "pr-0.5 data-disabled:opacity-40")}>
                <DateInput className="flex flex-1 items-center font-mono">
                    {(segment) => <DateSegment segment={segment} className={DATE_SEGMENT} />}
                </DateInput>
                <CalendarButton size={size} />
                <FocusCorners invalid={invalid} />
            </Group>
            {zone ? (
                <span id={zoneId} className={clsx(LABEL_TEXT, "shrink-0")}>
                    {zoneLabel(zone)}
                </span>
            ) : null}
            <Popover placement="bottom start">
                <Dialog className="p-3 outline-none">
                    <CalendarPanel />
                </Dialog>
            </Popover>
        </DatePicker>
    );
}
