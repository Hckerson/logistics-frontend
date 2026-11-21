"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import HudCorners from "@/components/ui/hud-corners";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { milesToNext, tripRoute, tripStops } from "@/lib/driver/route";
import { currentIndex } from "@/lib/driver/trip";
import { routeLine } from "@/lib/maps/route";
import type { LonLat } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    trip: DriverTripDto;
    here: LonLat | null;
}

const { trip: copy } = DRIVER_COPY;

export default function DriverRouteMap({ trip, here }: Props) {
    const polyline = trip.route?.polyline ?? null;
    const line = useMemo(() => (polyline ? routeLine(polyline) : null), [polyline]);
    const route = useMemo(() => tripRoute(trip, line, here), [trip, line, here]);
    const stops = useMemo(() => tripStops(trip), [trip]);
    const vehicle = useMemo(() => (here && trip.active ? { position: here, stale: false } : null), [here, trip.active]);
    const next = trip.stops[currentIndex(trip.stops)];
    const miles = milesToNext(trip, route);

    return (
        <section aria-label={fillTemplate(copy.map, { reference: trip.loadId })} className="border-border-dark relative h-[38svh] min-h-56 border lg:h-[26rem]">
            <FreightMap label={fillTemplate(copy.map, { reference: trip.loadId })} recentreLabel={copy.recentre} precision="street" stops={stops} route={route} vehicle={vehicle} />
            <HudCorners />
            {next ? (
                <div className="border-border-dark bg-background/85 pointer-events-none absolute bottom-3 left-3 flex max-w-[60%] flex-col gap-1 border px-3 py-2">
                    <p className="haulr-label text-text-muted">{copy.nextStop}</p>
                    <p className="text-text truncate text-sm">{next.facility.name}</p>
                    {next.arrivedAt ? (
                        <p className="text-accent font-mono text-xs">{copy.here}</p>
                    ) : miles !== null ? (
                        <p className="text-accent font-mono text-xs tabular-nums">{fillTemplate(copy.miles, { miles: grouped(miles) })}</p>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
