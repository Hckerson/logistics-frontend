"use client";
import { useEffect, useRef } from "react";
import DriverContacts from "@/components/common/driver-contacts";
import DriverLocationNotice from "@/components/common/driver-location-notice";
import DriverPod from "@/components/common/driver-pod";
import DriverRouteMap from "@/components/common/driver-route-map";
import DriverStopAction from "@/components/common/driver-stop-action";
import DriverStopCard from "@/components/common/driver-stop-card";
import DriverStops from "@/components/common/driver-stops";
import DriverSync from "@/components/common/driver-sync";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { currentIndex, nextAction, podOpen } from "@/lib/driver/trip";
import { useDriverLocation } from "@/lib/hooks/use-driver-location";
import { useStopEvents } from "@/lib/hooks/use-stop-events";

interface Props {
    owner: string;
    trip: DriverTripDto;
}

const { trip: copy } = DRIVER_COPY;
const SLOT = "empty:hidden";
const COLUMN = "contents lg:flex lg:min-w-0 lg:flex-col lg:gap-6";

const plan = ({ stops }: DriverTripDto) => stops.map(({ id, facility, windowStart, windowEnd }) => `${id}:${facility.name}:${windowStart}:${windowEnd}`).join("|");

export default function DriverTripView({ owner, trip: served }: Props) {
    const { trip, undoable, record, undo } = useStopEvents(owner, served);
    const location = useDriverLocation(trip.active);
    const announce = useAnnounce();
    const known = useRef<string | null>(null);
    const index = currentIndex(trip.stops);

    useEffect(() => {
        const next = plan(served);
        if (known.current && known.current !== next) announce({ message: copy.changed, tone: "assertive" });
        known.current = next;
    }, [served, announce]);

    return (
        <div className="flex flex-col gap-5 pb-40 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-8 lg:pb-0">
            <div className={COLUMN}>
                <div className={`${SLOT} order-1`}>{trip.active ? <DriverLocationNotice state={location.state} onEnable={location.request} /> : null}</div>
                <div className="order-2">
                    <DriverRouteMap trip={trip} here={location.coords} />
                </div>
                <div className={`${SLOT} order-5`}>
                    <DriverSync loadId={trip.loadId} />
                </div>
                <div className="order-6">
                    <DriverStops trip={trip} />
                </div>
            </div>
            <div className={`${COLUMN} lg:sticky lg:top-6`}>
                <div className={`${SLOT} order-3`}>{index !== -1 ? <DriverStopCard stop={trip.stops[index]} total={trip.stops.length} /> : null}</div>
                <div className={`${SLOT} order-4`}>{podOpen(trip) ? <DriverPod owner={owner} trip={trip} /> : null}</div>
                <DriverStopAction trip={trip} action={nextAction(trip)} undoable={undoable} onRecord={(next, extra) => record(next, { ...extra, ...location.where() })} onUndo={undo} />
                <div className="order-7">
                    <DriverContacts dispatch={trip.dispatch} />
                </div>
            </div>
        </div>
    );
}
