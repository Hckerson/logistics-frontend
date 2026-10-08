import type { Route } from "@/lib/types";
import { BEAM } from "@/lib/home/map-constants";
import { lanePoint } from "@/lib/home/lane";
import { lerp } from "@/lib/home/math";

export const beamWidth = (travelled: number) => 2 * BEAM.metres * (1 - BEAM.narrowing * travelled);

export function beamRoute(travelled: number): Route[] {
    const shares = Array.from({ length: BEAM.samples + 1 }, (_, index) => index / BEAM.samples);
    return [{ path: shares.map((share) => lanePoint(lerp(travelled, 1, share))), timestamps: shares }];
}
