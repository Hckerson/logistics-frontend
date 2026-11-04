"use client";
import { useMemo } from "react";
import type { LoadDto, LoadPositionsDto } from "@/lib/contract/schemas";
import { loadRoute } from "@/lib/loads/route";
import { routeLine } from "@/lib/maps/route";

export function useLoadRoute(load: LoadDto, positions: LoadPositionsDto | undefined) {
    const polyline = positions?.route?.polyline ?? null;
    const line = useMemo(() => (polyline ? routeLine(polyline) : null), [polyline]);
    return useMemo(() => (line && positions ? loadRoute(load, positions, line) : null), [load, positions, line]);
}
