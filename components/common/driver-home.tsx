"use client";
import DriverContacts from "@/components/common/driver-contacts";
import DriverLocationNotice from "@/components/common/driver-location-notice";
import DriverSaved from "@/components/common/driver-saved";
import DriverStatusLine from "@/components/common/driver-status-line";
import DriverSync from "@/components/common/driver-sync";
import DriverTripCard from "@/components/common/driver-trip-card";
import DriverUpcoming from "@/components/common/driver-upcoming";
import SectionFailure from "@/components/common/section-failure";
import Skeleton from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useDriverLocation } from "@/lib/hooks/use-driver-location";
import { useDriverTrips } from "@/lib/hooks/use-driver-trips";
import { failureFrom } from "@/lib/utils/action-result";

const { home: copy } = DRIVER_COPY;

export default function DriverHome() {
    const owner = useSession()?.id ?? "";
    const { data, savedAt, stale, query } = useDriverTrips(owner);
    const location = useDriverLocation(false);
    const trips = data?.trips ?? [];
    const current = trips.find((trip) => trip.active) ?? null;
    const upcoming = trips.filter((trip) => trip !== current);

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-text text-h5">{copy.title}</h1>
                    <DriverSaved savedAt={savedAt} stale={stale} />
                </div>
                <span className="text-xs">
                    <DriverStatusLine />
                </span>
            </header>
            {trips.length > 0 ? <DriverLocationNotice state={location.state} onEnable={location.request} /> : null}
            <DriverSync />
            {!data && query.isPending ? <Skeleton className="h-72" /> : null}
            {!data && query.isError ? <SectionFailure label={copy.upcoming} failure={failureFrom(query.error)} onRetry={() => query.refetch()} /> : null}
            {current ? <DriverTripCard trip={current} /> : null}
            {data && trips.length > 0 ? <DriverUpcoming trips={upcoming} /> : null}
            {data ? <DriverContacts dispatch={data.dispatch} lead={trips.length === 0 ? `${copy.none} ${copy.reach}` : undefined} /> : null}
        </div>
    );
}
