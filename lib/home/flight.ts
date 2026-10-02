import type { FlightView } from "@/lib/types";
import { FLIGHT } from "@/lib/home/constants";
import { lanePoint, truckAt } from "@/lib/home/lane";
import { lerp, ramp, smootherstep } from "@/lib/home/math";

const KEYS = ["longitude", "latitude", "zoom", "pitch", "bearing"] as const;

export function flightAt(progress: number, mobile: boolean): FlightView {
    const frames = mobile ? FLIGHT.mobile : FLIGHT.desktop;
    const next = frames.findIndex((frame) => frame.at > progress);
    const from = frames[next < 0 ? frames.length - 1 : Math.max(next - 1, 0)];
    const to = frames[next < 0 ? frames.length - 1 : next];
    const amount = from === to ? 0 : smootherstep(ramp(progress, from.at, to.at));

    const view = Object.fromEntries(
        KEYS.map((key) => [key, lerp(from[key], to[key], amount)]),
    ) as unknown as FlightView;

    const follow =
        FLIGHT.follow *
        smootherstep(ramp(progress, FLIGHT.followWindow[0], FLIGHT.followWindow[1])) *
        (1 - smootherstep(ramp(progress, FLIGHT.release[0], FLIGHT.release[1])));
    const [longitude, latitude] = lanePoint(truckAt(progress));

    return {
        ...view,
        longitude: lerp(view.longitude, longitude, follow),
        latitude: lerp(view.latitude, latitude, follow),
    };
}
