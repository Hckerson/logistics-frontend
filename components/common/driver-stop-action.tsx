"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Phone, Undo } from "@carbon/icons-react";
import DriverStatusLine from "@/components/common/driver-status-line";
import DriverStepSheet from "@/components/common/driver-step-sheet";
import Button from "@/components/ui/button";
import Countdown from "@/components/ui/countdown";
import type { DriverStopEventDto, DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { telOf } from "@/lib/driver/directions";
import { stopMoment } from "@/lib/loads/view";
import { squareButtonClass } from "@/lib/ui/classes";
import type { StopAction } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

type Extra = Pick<DriverStopEventDto, "seal" | "pieces">;

interface Props {
    trip: DriverTripDto;
    action: StopAction | null;
    undoable: { type: DriverStopEventDto["type"]; until: number } | null;
    onRecord: (action: StopAction, extra: Extra) => Promise<void>;
    onUndo: () => Promise<void>;
}

const { action: copy, trip: tripCopy, contact } = DRIVER_COPY;

export default function DriverStopAction({ trip, action, undoable, onRecord, onUndo }: Props) {
    const [sheet, setSheet] = useState(false);
    const [busy, setBusy] = useState(false);
    const last = trip.stops[trip.stops.length - 1];
    const label = action ? fillTemplate(action.type === "arrive" ? copy.arrive : copy.depart, { name: action.stop.facility.name }) : "";
    const needsDetails = action?.type === "depart" && action.stop.type === "pickup";

    const record = async (extra: Extra) => {
        if (!action || busy) return;
        setSheet(false);
        setBusy(true);
        await onRecord(action, extra);
        setBusy(false);
    };

    return (
        <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:static lg:order-5 lg:border lg:pb-0 lg:backdrop-blur-none">
            <div className="haulr-shell flex flex-col gap-2.5 py-3 lg:w-auto lg:px-4">
                {action ? (
                    <Button size="wide" trailing={ArrowRight} pending={busy} onPress={() => (needsDetails ? setSheet(true) : void record({}))} className="min-h-14 text-base">
                        {label}
                    </Button>
                ) : (
                    <p className="text-text-secondary flex min-h-14 items-center text-sm">
                        {trip.active || last.departedAt
                            ? last.departedAt
                                ? fillTemplate(tripCopy.completeAt, { time: stopMoment(last.departedAt, last.facility.timeZone) })
                                : tripCopy.complete
                            : tripCopy.notStarted}
                    </p>
                )}
                <div className="flex min-h-9 items-center justify-between gap-3 text-xs">
                    <DriverStatusLine loadId={trip.loadId} />
                    <span className="flex items-center gap-3">
                        {undoable ? (
                            <Button tone="link" size="inline" icon={Undo} onPress={() => void onUndo()} className="min-h-11">
                                {fillTemplate(copy.undo, { event: copy.events[undoable.type] })}
                                <Countdown deadline={undoable.until} format="clock" className="ml-1.5" />
                            </Button>
                        ) : null}
                        {trip.dispatch ? (
                            <Link href={telOf(trip.dispatch.phone)} aria-label={fillTemplate(contact.dispatch, { name: trip.dispatch.name })} className={squareButtonClass("outline", "lg")}>
                                <Phone aria-hidden className="size-4" />
                            </Link>
                        ) : null}
                    </span>
                </div>
            </div>
            {action && needsDetails ? (
                <DriverStepSheet
                    isOpen={sheet}
                    title={label}
                    kicker={fillTemplate(tripCopy.stopOf, { sequence: String(action.stop.sequence), total: String(trip.stops.length) })}
                    onClose={() => setSheet(false)}
                    onConfirm={(details) => void record(details)}
                />
            ) : null}
        </div>
    );
}
