"use client";
import DriverSaved from "@/components/common/driver-saved";
import DriverTripHeader from "@/components/common/driver-trip-header";
import DriverTripView from "@/components/common/driver-trip-view";
import SectionFailure from "@/components/common/section-failure";
import ButtonLink from "@/components/ui/button-link";
import Skeleton from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { appRoutes } from "@/lib/app-routes";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useTrip } from "@/lib/hooks/use-driver-trips";
import { failureFrom } from "@/lib/utils/action-result";

interface Props {
    loadId: string;
}

const { trip: copy } = DRIVER_COPY;

export default function DriverTrip({ loadId }: Props) {
    const owner = useSession()?.id ?? "";
    const { data, savedAt, stale, query, withdrawn } = useTrip(owner, loadId);
    const trip = withdrawn ? null : (data ?? null);

    return (
        <div className="flex flex-col gap-5">
            <DriverTripHeader loadId={loadId} trip={trip} saved={<DriverSaved savedAt={trip ? savedAt : null} stale={stale} />} />
            {withdrawn ? (
                <div role="alert" className="border-signal-warning flex flex-col gap-3 border-l-2 pl-3">
                    <p className="text-text text-sm">{copy.withdrawn}</p>
                    <ButtonLink href={appRoutes.driverHome()} size="wide" className="max-w-sm">
                        {copy.back}
                    </ButtonLink>
                </div>
            ) : null}
            {!withdrawn && !data && query.isPending ? <Skeleton className="h-[38svh]" /> : null}
            {!withdrawn && !data && query.isError ? <SectionFailure label={loadId} failure={failureFrom(query.error)} onRetry={() => query.refetch()} /> : null}
            {trip ? <DriverTripView owner={owner} trip={trip} /> : null}
        </div>
    );
}
