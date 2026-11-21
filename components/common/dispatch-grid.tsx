"use client";
import { useId } from "react";
import DispatchGridRow from "@/components/common/dispatch-grid-row";
import type { FleetEntryDto, FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET } from "@/lib/fleet/constants";
import { dayLabel } from "@/lib/fleet/grid";
import { usePlanGrid } from "@/lib/hooks/use-plan-grid";
import type { PlanRow } from "@/lib/types";

interface Props {
    rows: readonly PlanRow[];
    days: readonly string[];
    timeZone: string;
    flagged: ReadonlySet<string>;
    back: string;
    readOnly: boolean;
    onDrop: (entry: FleetEntryDto, target: PlanRow, from: PlanRow) => void;
    onWeek: (weeks: number) => void;
    onMark: (truck: FleetTruckDto) => void;
    onEnd: (truck: FleetTruckDto, period: FleetUnavailableDto) => void;
}

const { grid: copy } = FLEET_COPY;
const LAYOUT = "grid grid-cols-[13rem_repeat(7,minmax(7rem,1fr))]";

export default function DispatchGrid({ rows, days, timeZone, flagged, back, readOnly, onDrop, onWeek, onMark, onEnd }: Props) {
    const keysId = useId();
    const { grid, focus, move, status, verdict, onKeyDown, sync, drag } = usePlanGrid({ rows, readOnly, onDrop, onWeek });
    const active = { ...focus, row: Math.min(focus.row, rows.length - 1) };

    return (
        <div className="flex flex-col gap-2">
            <p id={keysId} className="text-text-muted text-xs">
                {copy.keys}
            </p>
            <p role="status" className="text-text min-h-4 text-xs">
                {status}
            </p>
            <div className="border-border-dark overflow-x-auto border">
                <div
                    ref={grid}
                    role="grid"
                    aria-label={copy.label}
                    aria-describedby={keysId}
                    aria-rowcount={rows.length + 1}
                    aria-colcount={FLEET.weekDays + 1}
                    onKeyDown={onKeyDown}
                    className="min-w-max"
                >
                    <div role="row" aria-rowindex={1} className={LAYOUT}>
                        <div role="columnheader" className="haulr-label text-text-muted px-2 py-2">
                            {copy.truck}
                        </div>
                        {days.map((day) => (
                            <div key={day} role="columnheader" className="haulr-label text-text-muted border-border border-l px-2 py-2">
                                {dayLabel(day)}
                            </div>
                        ))}
                    </div>
                    {rows.map((row, index) => (
                        <DispatchGridRow
                            key={row.key}
                            row={row}
                            index={index}
                            days={days}
                            timeZone={timeZone}
                            focus={active}
                            target={move && move.target === index ? verdict : null}
                            pickedId={move?.entry.loadId ?? null}
                            flagged={flagged}
                            back={back}
                            readOnly={readOnly}
                            layout={LAYOUT}
                            onSync={sync}
                            onMark={onMark}
                            onEnd={onEnd}
                            drag={drag}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
