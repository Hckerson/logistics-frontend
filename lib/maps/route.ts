import { pointAlong } from "@/lib/auth/point-along";
import { decodePolyline } from "@/lib/maps/polyline";
import type { LonLat, RouteLine } from "@/lib/types";
import { cumulativeMiles } from "@/lib/utils/geo";

const RADIANS = Math.PI / 180;

export const routeLine = (polyline: string): RouteLine | null => {
    const path = decodePolyline(polyline);
    if (path.length < 2) return null;
    const miles = cumulativeMiles(path);
    const total = miles[miles.length - 1] || 1;
    return { path, timestamps: miles.map((mile) => mile / total) };
};

export const shareAt = ({ path, timestamps }: RouteLine, [lon, lat]: LonLat) => {
    const scale = Math.cos(lat * RADIANS);
    let nearest = { gap: Infinity, share: 0 };

    for (let index = 1; index < path.length; index++) {
        const [fromLon, fromLat] = path[index - 1];
        const [toLon, toLat] = path[index];
        const run = [(toLon - fromLon) * scale, toLat - fromLat];
        const offset = [(lon - fromLon) * scale, lat - fromLat];
        const span = run[0] ** 2 + run[1] ** 2;
        const along = span ? Math.min(1, Math.max(0, (offset[0] * run[0] + offset[1] * run[1]) / span)) : 0;
        const gap = (offset[0] - along * run[0]) ** 2 + (offset[1] - along * run[1]) ** 2;
        if (gap < nearest.gap) nearest = { gap, share: timestamps[index - 1] + along * (timestamps[index] - timestamps[index - 1]) };
    }

    return nearest.share;
};

export const pointAtShare = ({ path, timestamps }: RouteLine, share: number): LonLat => pointAlong(path, timestamps, share);
