"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { pointAtShare } from "@/lib/maps/route";
import { mapStops } from "@/lib/tracking/view";
import type { LonLat, MapRoute, MapVehicle } from "@/lib/types";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    tracking: PublicTrackingDto;
    route: MapRoute | null;
    stale: boolean;
    label: string;
    recentreLabel: string;
}

export default function TrackingMap({ tracking, route, stale, label, recentreLabel }: Props) {
    const { stops, position } = tracking;
    const placed = useMemo(() => mapStops(stops), [stops]);
    const vehicle = useMemo((): MapVehicle | null => {
        if (!position) return null;
        const reported: LonLat = [position.longitude, position.latitude];
        return { position: route ? pointAtShare(route, route.travelled) : reported, stale };
    }, [position, route, stale]);

    return <FreightMap label={label} recentreLabel={recentreLabel} precision="city" stops={placed} route={route} vehicle={vehicle} />;
}
