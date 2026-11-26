"use client";
import clsx from "clsx";
import Link from "next/link";
import { WarningAlt } from "@carbon/icons-react";
import { appRoutes } from "@/lib/app-routes";
import type { FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET } from "@/lib/fleet/constants";
import { entryLabel, truckName, windowSearch } from "@/lib/fleet/grid";
import { stopMoment } from "@/lib/loads/view";
import type { PlacedItem } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { withBack } from "@/lib/navigation/back";

interface Props {
    placed: PlacedItem;
    truck: FleetTruckDto | null;
    timeZone: string;
    address: string;
    active: boolean;
    flagged: boolean;
    picked: boolean;
    back: string;
    readOnly: boolean;
    onFocus: () => void;
    onEnd: (period: FleetUnavailableDto) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

const { grid, reasons } = FLEET_COPY;
const BOX = "absolute left-0 z-10 flex h-10 min-w-0 flex-col justify-center border-l-2 px-2 text-left text-xs leading-tight outline-none focus-visible:outline-2 focus-visible:outline-text";

export default function DispatchItem(props: Props) {
    const { placed, truck, timeZone, address, active, flagged, picked, back, readOnly, onFocus, onEnd, onDragStart, onDragEnd } = props;
    const { item, span, lane } = placed;
    const name = truck ? truckName(truck) : grid.unassigned;
    const shared = {
        "data-item": address,
        tabIndex: active ? 0 : -1,
        onFocus,
        style: { top: `${lane * FLEET.laneRem + 0.125}rem`, width: `calc(${span * 100}% + ${span - 2}px)` },
    };

    if (item.kind === "entry") {
        const { entry } = item;
        return (
            <Link
                {...shared}
                href={withBack(appRoutes.load(entry.loadId), back)}
                draggable={entry.movable && !readOnly}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                aria-label={`${entryLabel(entry)}${flagged ? `. ${FLEET_COPY.conflicts.label}` : ""}`}
                className={clsx(BOX, "bg-background-muted text-text hover:bg-border/60", entry.movable ? "border-accent" : "border-signal-live", picked && "ring-accent ring-2")}
            >
                <span className="flex items-center gap-1 font-mono">
                    {flagged ? <WarningAlt aria-hidden className="text-signal-warning size-3 shrink-0" /> : null}
                    <span className="truncate">{entry.loadId}</span>
                </span>
                <span className="text-text-muted truncate">{`${entry.origin.city} → ${entry.destination.city}`}</span>
            </Link>
        );
    }

    if (item.kind === "unavailable") {
        const { period } = item;
        const label = fillTemplate(grid.unavailable, { truck: name, reason: reasons[period.reason], until: stopMoment(period.to, timeZone) });
        const body = (
            <>
                <span className="truncate">{reasons[period.reason]}</span>
                <span className="text-text-muted truncate">{fillTemplate(grid.until, { time: stopMoment(period.to, timeZone) })}</span>
            </>
        );
        const look = clsx(BOX, "border-signal-warning bg-signal-warning-wash text-text-secondary");
        return readOnly ? (
            <span {...shared} role="note" aria-label={label} className={look}>
                {body}
            </span>
        ) : (
            <button {...shared} type="button" aria-label={label} onClick={() => onEnd(period)} className={clsx(look, "cursor-pointer")}>
                {body}
            </button>
        );
    }

    const { window } = item;
    const label = fillTemplate(grid.window, { truck: name, hours: String(window.hours), city: window.city, region: window.region, from: stopMoment(window.from, timeZone) });
    return (
        <Link
            {...shared}
            href={truck ? windowSearch(window, truck.equipment, back) : appRoutes.loadBoard()}
            aria-label={label}
            className={clsx(BOX, "border-border-dark text-text-muted hover:text-text border border-l-2 border-dashed bg-transparent")}
        >
            <span className="truncate">{fillTemplate(grid.open, { hours: String(window.hours) })}</span>
            <span className="truncate">{window.city}</span>
        </Link>
    );
}
