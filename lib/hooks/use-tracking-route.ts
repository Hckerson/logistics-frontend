"use client";
import { useMemo } from "react";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { routeLine } from "@/lib/maps/route";
import { trackingRoute } from "@/lib/tracking/route";

export function useTrackingRoute(tracking: PublicTrackingDto, stale: boolean) {
    const polyline = tracking.route?.polyline ?? null;
    const line = useMemo(() => (polyline ? routeLine(polyline) : null), [polyline]);
    return useMemo(() => (line ? trackingRoute(tracking, line, stale) : null), [tracking, line, stale]);
}
