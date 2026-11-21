import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@carbon/icons-react";
import DriverLane from "@/components/common/driver-lane";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { laneProgress } from "@/lib/driver/route";
import { loadStatusDisplay } from "@/lib/loads/status";

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
                <Link href={appRoutes.driverHome()} className={`${QUIET_LINK} inline-flex min-h-11 items-center gap-1.5`}>
                    <ArrowLeft aria-hidden className="size-4" />
                    {copy.back}
                </Link>
                {saved}
            </div>
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-text font-mono text-sm tracking-tight">{loadId}</h1>
                {trip ? <StatusLabel {...loadStatusDisplay(trip.status)} /> : null}
            </div>
            {first && last && trip ? (
                <>
                    <DriverLane origin={first.city} destination={last.city} progress={laneProgress(trip.stops)} />
                    <p className="text-text-secondary text-xs">
                        {trip.shipperName} · {trip.commodity}
                    </p>
                </>
            ) : null}
        </header>
    );
}
