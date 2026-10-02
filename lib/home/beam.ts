import type { LonLat } from "@/lib/types";
import { BEAM } from "@/lib/home/constants";
import { laneNormal, lanePoint } from "@/lib/home/lane";
import { lerp } from "@/lib/home/math";

export function beamPolygon(travelled: number): LonLat[] {
    const reach = BEAM.degrees * (1 - BEAM.narrowing * travelled);
    const left: LonLat[] = [];
    const right: LonLat[] = [];

    for (let step = 0; step <= BEAM.samples; step++) {
        const share = step / BEAM.samples;
        const t = lerp(travelled, 1, share);
        const [lon, lat] = lanePoint(t);
        const [nx, ny] = laneNormal(t);
        const half = reach * Math.pow(share, BEAM.power);
        left.push([lon + nx * half, lat + ny * half]);
        right.push([lon - nx * half, lat - ny * half]);
    }

    return [...left, ...right.reverse()];
}
