"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LoadDto, LoadPositionsDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { loadMapStops } from "@/lib/loads/view";
import { pointAtShare } from "@/lib/maps/route";
import type { LonLat, MapRoute, MapVehicle } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    load: LoadDto;
    positions: LoadPositionsDto | undefined;
    route: MapRoute | null;
    stale: boolean;
}

const { tracking: copy } = LOAD_COPY;
const NO_TRACK: readonly LonLat[] = [];

export default function LoadMap({ load, positions, route, stale }: Props) {
    const latest = positions?.latest ?? null;
    const history = positions?.track;
    const stops = useMemo(() => loadMapStops(load.stops), [load.stops]);
    const track = useMemo(() => history?.map(({ longitude, latitude }): LonLat => [longitude, latitude]) ?? NO_TRACK, [history]);
    const vehicle = useMemo((): MapVehicle | null => {
        if (!latest) return null;
        return { position: route ? pointAtShare(route, route.travelled) : [latest.longitude, latest.latitude], stale };
    }, [latest, route, stale]);
    const label = latest ? fillTemplate(copy.map, { reference: load.id, city: latest.city }) : fillTemplate(copy.mapIdle, { reference: load.id });

    return <FreightMap label={label} recentreLabel={copy.recentre} precision="street" stops={stops} route={route} track={track} vehicle={vehicle} />;
}
