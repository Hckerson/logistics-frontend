"use client";
import clsx from "clsx";
import { EventSchedule } from "@carbon/icons-react";
import DispatchItem from "@/components/common/dispatch-item";
import DispatchTruck from "@/components/common/dispatch-truck";
import type { FleetEntryDto, FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET } from "@/lib/fleet/constants";
import { cellItems, dayLabel, truckName } from "@/lib/fleet/grid";
import type { GridFocus, PlanRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    row: PlanRow;
    index: number;
    days: readonly string[];
    timeZone: string;
    focus: GridFocus;
    target: { valid: boolean; message: string } | null;
    pickedId: string | null;
    flagged: ReadonlySet<string>;
    back: string;
    readOnly: boolean;
    layout: string;
    onSync: (focus: GridFocus) => void;
    onMark: (truck: FleetTruckDto) => void;
    onEnd: (truck: FleetTruckDto, period: FleetUnavailableDto) => void;
    drag: { start: (entry: FleetEntryDto, row: number) => void; over: (row: number) => boolean; drop: () => void; end: () => void };
}

const { grid, unavailable } = FLEET_COPY;
const CELL = "border-border relative border-l outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-text";

export default function DispatchGridRow(props: Props) {
    const { row, index, days, timeZone, focus, target, pickedId, flagged, back, readOnly, layout, onSync, onMark, onEnd, drag } = props;
    const name = row.truck ? truckName(row.truck) : grid.unassigned;
    const here = (col: number, item: number | null) => focus.row === index && focus.col === col && focus.item === item;
    const height = { minHeight: `${row.lanes * FLEET.laneRem + 0.5}rem` };

    return (
        <div
            role="row"
            aria-rowindex={index + 2}
            onDragOver={(event) => {
                if (drag.over(index)) event.preventDefault();
            }}
            onDrop={drag.drop}
            className={clsx(layout, "border-border border-t", target && (target.valid ? "bg-accent/10" : "bg-error/10"))}
        >
            <div
                role="rowheader"
                data-cell={`${index}:0`}
                tabIndex={here(0, null) ? 0 : -1}
                onFocus={(event) => event.target === event.currentTarget && onSync({ row: index, col: 0, item: null, entered: false })}
                className={clsx(CELL, "flex items-start justify-between gap-2 border-l-0 p-2")}
                style={height}
            >
                {row.row ? (
                    <DispatchTruck row={row.row} />
                ) : (
                    <span className="flex flex-col text-xs leading-tight">
                        <span className="text-text font-medium">{grid.unassigned}</span>
                        <span className="text-text-muted">{grid.unassignedHint}</span>
                    </span>
                )}
                {row.truck && !readOnly ? (
                    <button
                        type="button"
                        data-item={`${index}:0:0`}
                        tabIndex={here(0, 0) ? 0 : -1}
                        aria-label={fillTemplate(unavailable.markTruck, { truck: name })}
                        onFocus={() => onSync({ row: index, col: 0, item: 0, entered: false })}
                        onClick={() => row.truck && onMark(row.truck)}
                        className="text-text-muted hover:text-text focus-visible:outline-text grid size-7 shrink-0 cursor-pointer place-items-center outline-none focus-visible:outline-2"
                    >
                        <EventSchedule aria-hidden className="size-4" />
                    </button>
                ) : null}
            </div>
            {days.map((day, dayIndex) => {
                const col = dayIndex + 1;
                const items = cellItems(row, dayIndex);
                const label = fillTemplate(grid.cell, { truck: name, day: dayLabel(day) });
                return (
                    <div
                        key={day}
                        role="gridcell"
                        data-cell={`${index}:${col}`}
                        tabIndex={here(col, null) ? 0 : -1}
                        aria-label={items.length > 1 ? `${label}. ${pluralize(items.length, grid.cellItems)}` : label}
                        onFocus={(event) => event.target === event.currentTarget && onSync({ row: index, col, item: null, entered: false })}
                        className={CELL}
                        style={height}
                    >
                        {items.map((placed, itemIndex) => (
                            <DispatchItem
                                key={placed.key}
                                placed={placed}
                                truck={row.truck}
                                timeZone={timeZone}
                                address={`${index}:${col}:${itemIndex}`}
                                active={here(col, itemIndex)}
                                flagged={placed.item.kind === "entry" && flagged.has(placed.item.entry.loadId)}
                                picked={placed.item.kind === "entry" && placed.item.entry.loadId === pickedId}
                                back={back}
                                readOnly={readOnly}
                                onFocus={() => onSync({ row: index, col, item: itemIndex, entered: items.length > 1 })}
                                onEnd={(period) => row.truck && onEnd(row.truck, period)}
                                onDragStart={() => placed.item.kind === "entry" && drag.start(placed.item.entry, index)}
                                onDragEnd={drag.end}
                            />
                        ))}
                    </div>
                );
            })}
            {target ? (
                <p aria-hidden className={clsx("col-span-full px-2 pb-1 text-xs", target.valid ? "text-text" : "text-error")}>
                    {target.message}
                </p>
            ) : null}
        </div>
    );
}
