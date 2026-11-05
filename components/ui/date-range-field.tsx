"use client";
import clsx from "clsx";
import { useId, useRef } from "react";
import { toCalendarDate, type CalendarDate } from "@internationalized/date";
import {
    DateInput,
    DateRangePicker,
    DateSegment,
    Dialog,
    Group,
    type DateRange,
    type DateRangePickerState,
    type DateValue,
    type RangeValue,
} from "react-aria-components";
import CalendarButton from "@/components/ui/calendar-button";
import CalendarPanel from "@/components/ui/calendar-panel";
import FieldError, { fieldErrorId } from "@/components/ui/field-error";
import FocusCorners from "@/components/ui/focus-corners";
import Popover from "@/components/ui/popover";
import { describedBy, fieldClass } from "@/lib/ui/classes";
import { DATE_SEGMENT, LABEL_TEXT, MINUTE_STEP, WINDOW_MINUTES } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { fromDateRange, sameDate, settleWindow, toDateRange, toDateValue, zoneLabel } from "@/lib/utils/date-value";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { DateControl, DateRangeValue, DateTiming } from "@/lib/types";

type Props = DateTiming &
    DateControl & {
        startName?: string;
        endName?: string;
        value: DateRangeValue | null;
        onChange: (value: DateRangeValue | null) => void;
        maxDays?: number;
        windowMinutes?: number;
    };

const rangeError = (range: DateRange | null, windowed: boolean, maxDays?: number) => {
    if (!range) return undefined;
    if (range.end.compare(range.start) < 0) return windowed ? UI_COPY.windowOrder : UI_COPY.rangeOrder;
    if (maxDays && toCalendarDate(range.end).compare(toCalendarDate(range.start)) >= maxDays) {
        return fillTemplate(UI_COPY.rangeSpan, { days: String(maxDays) });
    }
    return undefined;
};

export default function DateRangeField(props: Props) {
    const { id, value, onChange, size = "md", invalid = false, maxDays, step = MINUTE_STEP, windowMinutes = WINDOW_MINUTES } = props;
    const zoneId = useId();
    const errorId = useId();
    const picking = useRef(false);
    const zone = props.granularity === "minute" ? props.timeZone : null;
    const range = toDateRange(value, zone);
    const error = rangeError(range, zone !== null, maxDays);
    const flagged = invalid || error !== undefined;

    const settle = (next: RangeValue<DateValue | null>) =>
        zone && !props.isReadOnly && !props.isDisabled ? settleWindow(next, zone, step, windowMinutes) : null;

    const commit = (state: DateRangePickerState) => {
        const next = settle(state.value);
        if (next && !(sameDate(state.value.start, next.start) && sameDate(state.value.end, next.end))) state.setValue(next);
    };

    const outOfSpan = (date: DateValue, anchor: CalendarDate | null) => Boolean(maxDays && anchor && Math.abs(date.compare(anchor)) >= maxDays);

    return (
        <DateRangePicker<DateValue>
            id={id}
            startName={props.startName}
            endName={props.endName}
            value={range}
            onChange={(next) => onChange(fromDateRange(next && picking.current ? (settle(next) ?? next) : next, zone))}
            onOpenChange={(open) => {
                picking.current = open;
            }}
            minValue={toDateValue(props.min, zone)}
            maxValue={toDateValue(props.max, zone)}
            isDateUnavailable={maxDays ? outOfSpan : undefined}
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
            {({ state }) => (
                <>
                    <div className="flex min-w-0 items-center gap-3">
                        <Group
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) commit(state);
                            }}
                            className={fieldClass(size, flagged, "pr-0.5 data-disabled:opacity-40")}
                        >
                            <DateInput slot="start" className="flex items-center font-mono">
                                {(segment) => <DateSegment segment={segment} className={DATE_SEGMENT} />}
                            </DateInput>
                            <span aria-hidden className="text-text-muted px-1.5">
                                {UI_COPY.rangeSeparator}
                            </span>
                            <DateInput slot="end" className="flex flex-1 items-center font-mono">
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
                            <CalendarPanel range />
                        </Dialog>
                    </Popover>
                </>
            )}
        </DateRangePicker>
    );
}
