"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { laneOf, mapStops } from "@/lib/tracking/view";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    tracking: PublicTrackingDto;
    stale: boolean;
    label: string;
}

export default function TrackingMap({ tracking, stale, label }: Props) {
    const { stops, position } = tracking;
    const placed = useMemo(() => mapStops(stops), [stops]);
    const lane = useMemo(() => laneOf(stops), [stops]);
    const vehicle = useMemo(
        () => (position ? { position: [position.longitude, position.latitude] satisfies [number, number], stale } : null),
        [position, stale],
    );

    return <FreightMap label={label} precision="city" stops={placed} track={lane} vehicle={vehicle} />;
}
