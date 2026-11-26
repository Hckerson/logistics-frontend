import type { ReactNode } from "react";
import Breadcrumbs from "@/components/common/breadcrumbs";
import LaneLine from "@/components/common/lane-line";
import StatusLabel from "@/components/ui/status-label";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { laneProgress } from "@/lib/driver/route";
import { loadStatusDisplay } from "@/lib/loads/status";
import { fillTemplate } from "@/lib/utils/fill-template";
import { tripTrail } from "@/lib/navigation/trails";

interface Props {
    loadId: string;
    trip: DriverTripDto | null;
    saved: ReactNode;
}

const { trip: copy } = DRIVER_COPY;

export default function DriverTripHeader({ loadId, trip, saved }: Props) {
    const first = trip?.stops[0]?.facility;
    const last = trip?.stops[trip.stops.length - 1]?.facility;

    return (
        <header className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <Breadcrumbs trail={tripTrail()} current={loadId} mono />
                {saved}
            </div>
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-text font-mono text-sm tracking-tight">{loadId}</h1>
                {trip ? <StatusLabel {...loadStatusDisplay(trip.status)} /> : null}
            </div>
            {first && last && trip ? (
                <>
                    <LaneLine origin={first.city} destination={last.city} progress={laneProgress(trip.stops)} label={fillTemplate(copy.lane, { origin: first.city, destination: last.city })} />
                    <p className="text-text-secondary text-xs">
                        {trip.shipperName} · {trip.commodity}
                    </p>
                </>
            ) : null}
        </header>
    );
}
