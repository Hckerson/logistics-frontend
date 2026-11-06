"use client";
import clsx from "clsx";
import { useId, useRef } from "react";
import { DateInput, DatePicker, DateSegment, Dialog, Group, type DateValue } from "react-aria-components";
import CalendarButton from "@/components/ui/calendar-button";
import CalendarPanel from "@/components/ui/calendar-panel";
import FieldError, { fieldErrorId } from "@/components/ui/field-error";
import FocusCorners from "@/components/ui/focus-corners";
import Popover from "@/components/ui/popover";
import { describedBy, fieldClass } from "@/lib/ui/classes";
import { DATE_SEGMENT, LABEL_TEXT, MINUTE_STEP } from "@/lib/ui/constants";
import { boundMessage, boundOf, boundsNote, fromDateValue, sameDate, snapToStep, toDateValue, zoneLabel } from "@/lib/utils/date-value";
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
    const errorId = useId();
    const picking = useRef(false);
    const zone = props.granularity === "minute" ? props.timeZone : null;
    const floor = toDateValue(min, zone);
    const ceiling = toDateValue(max, zone);
    const bound = boundOf(toDateValue(value, zone), floor, ceiling);
    const error = !invalid && bound ? boundMessage(bound, floor, ceiling, zone) : undefined;
    const flagged = invalid || bound !== null;
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
            minValue={floor}
            maxValue={ceiling}
            granularity={zone ? "minute" : "day"}
            hideTimeZone
            shouldForceLeadingZeros
            isInvalid={flagged}
            isDisabled={props.isDisabled}
            isReadOnly={props.isReadOnly}
            isRequired={props.isRequired}
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            aria-describedby={describedBy(props["aria-describedby"], zone && zoneId, error && fieldErrorId(errorId))}
            className="flex min-w-0 flex-col gap-1.5"
        >
            <div className="flex min-w-0 items-center gap-3">
                <Group className={fieldClass(size, flagged, "pr-0.5 data-disabled:opacity-40")}>
                    <DateInput className="flex flex-1 items-center font-mono">
                        {(segment) => <DateSegment segment={segment} className={DATE_SEGMENT} />}
                    </DateInput>
                    <CalendarButton size={size} />
                    <FocusCorners invalid={flagged} />
                </Group>
                {zone ? (
                    <span id={zoneId} className={clsx(LABEL_TEXT, "shrink-0")}>
                        {zoneLabel(zone)}
                    </span>
                ) : null}
            </div>
            {error ? <FieldError id={errorId} message={error} /> : null}
            <Popover placement="bottom start">
                <Dialog className="p-3 outline-none">
                    <CalendarPanel note={boundsNote(floor, ceiling, zone)} />
                </Dialog>
            </Popover>
        </DatePicker>
    );
}
