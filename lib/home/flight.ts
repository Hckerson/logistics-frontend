import type { FlightView } from "@/lib/types";
import { FLIGHT } from "@/lib/home/map-constants";
import { laneHeading, lanePoint, truckAt } from "@/lib/home/lane";
import { lerp, ramp, smootherstep } from "@/lib/home/math";

const KEYS = ["longitude", "latitude", "zoom", "pitch", "bearing"] as const;
const TURN = 360;

const ease = (progress: number, [start, end]: readonly [number, number]) => smootherstep(ramp(progress, start, end));
const turn = (from: number, to: number) => ((((to - from) % TURN) + TURN * 1.5) % TURN) - TURN / 2;

export function flightAt(progress: number, mobile: boolean): FlightView {
    const frames = mobile ? FLIGHT.mobile : FLIGHT.desktop;
    const next = frames.findIndex((frame) => frame.at > progress);
    const from = frames[next < 0 ? frames.length - 1 : Math.max(next - 1, 0)];
    const to = frames[next < 0 ? frames.length - 1 : next];
    const amount = from === to ? 0 : smootherstep(ramp(progress, from.at, to.at));

    const view = Object.fromEntries(
        KEYS.map((key) => [key, lerp(from[key], to[key], amount)]),
    ) as unknown as FlightView;

    const held = 1 - ease(progress, FLIGHT.release);
    const follow = FLIGHT.follow * ease(progress, FLIGHT.followWindow) * held;
    const chase = ease(progress, FLIGHT.chase.window) * held;
    const travelled = truckAt(progress);
    const [longitude, latitude] = lanePoint(travelled + FLIGHT.chase.lookAhead * chase);

    return {
        ...view,
        longitude: lerp(view.longitude, longitude, follow),
        latitude: lerp(view.latitude, latitude, follow),
        bearing: view.bearing + turn(view.bearing, laneHeading(travelled, FLIGHT.chase.smoothing)) * chase,
    };
}
