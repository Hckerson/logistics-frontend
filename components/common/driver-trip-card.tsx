import { ArrowRight } from "@carbon/icons-react";
import BoardReadout from "@/components/common/board-readout";
import HudPanel from "@/components/common/hud-panel";
import LaneLine from "@/components/common/lane-line";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import type { DriverTripSummaryDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { stopWindow } from "@/lib/loads/view";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    trip: DriverTripSummaryDto;
}

const { home: copy, trip: tripCopy, stopTypes } = DRIVER_COPY;

export default function DriverTripCard({ trip }: Props) {
    const { loadId, status, nextStop, stopsDone, stopCount, origin, destination } = trip;
    const window = nextStop ? stopWindow({ windowStart: nextStop.windowStart, windowEnd: nextStop.windowEnd, facility: { timeZone: nextStop.timeZone } }) : "";

    return (
        <HudPanel label={copy.inProgress} status={LOAD_STATUS_LABELS[status]} note={loadId}>
            <LaneLine origin={origin.city} destination={destination.city} progress={stopsDone / Math.max(stopCount, 1)} label={fillTemplate(tripCopy.lane, { origin: origin.city, destination: destination.city })} />
            {nextStop ? (
                <div className="border-border flex flex-col gap-2 border-t pt-4">
                    <p className="haulr-label text-accent">{fillTemplate(copy.nextStop, { type: stopTypes[nextStop.type] })}</p>
                    <p className="text-text text-lg">{nextStop.name}</p>
                    <p className="text-text-secondary text-xs">
                        {nextStop.city}, {nextStop.region} · {fillTemplate(copy.progress, { done: String(Math.min(stopsDone + 1, stopCount)), total: String(stopCount) })}
                    </p>
                    <p className="sr-only">{window}</p>
                    <BoardReadout value={shortTime(nextStop.windowStart, nextStop.timeZone)} tall={false} />
                    <p aria-hidden className="text-text-muted text-xs">
                        {`${dayName(nextStop.windowStart, nextStop.timeZone)} · ${fillTemplate(tripCopy.until, { time: clockTime(nextStop.windowEnd, nextStop.timeZone) })}`}
                    </p>
                </div>
            ) : (
                <p className="text-signal-warning border-border border-t pt-4 text-sm">{copy.podNeeded}</p>
            )}
            <ButtonLink
                href={appRoutes.driverTrip(loadId)}
                size="wide"
                trailing={ArrowRight}
                className="min-h-14 text-base"
                aria-label={nextStop ? fillTemplate(copy.continueLabel, { reference: loadId, type: stopTypes[nextStop.type].toLowerCase(), city: nextStop.city, window }) : undefined}
            >
                {copy.continue}
            </ButtonLink>
        </HudPanel>
    );
}
