import type { Camera, Point, StageSize } from "@/lib/types";
import { FRAMES, MOBILE_WIDTH, SCENES, ZOOM } from "@/lib/home/constants";
import { pointOnCurve } from "@/lib/home/geometry";
import { lerp, ramp, smootherstep } from "@/lib/home/math";
import { NETWORK_MAP } from "@/lib/home/network";

const LANE_MID = pointOnCurve(NETWORK_MAP.origin, NETWORK_MAP.control, NETWORK_MAP.destination, 0.5);
const MOBILE_ZOOM = 0.6;
const FOLLOW = 0.6;

const phases = (progress: number) => ({
    lane: smootherstep(ramp(progress, SCENES.quote[0], SCENES.quote[0] + 0.1)),
    book: smootherstep(ramp(progress, SCENES.book[0], SCENES.book[0] + 0.08)),
    track: smootherstep(ramp(progress, SCENES.track[0] - 0.02, SCENES.track[0] + 0.06)),
});

export function cameraAt(progress: number, truck: Point, size: StageSize): Camera {
    const mobile = size.width < MOBILE_WIDTH;
    const { lane, book, track } = phases(progress);
    const frame = mobile ? FRAMES.mobile : FRAMES.desktop;
    const fit = Math.min(
        size.width * frame.width,
        (size.height * (frame.bottom - frame.top)) / NETWORK_MAP.height,
    );
    const follow = { x: lerp(LANE_MID.x, truck.x, FOLLOW), y: lerp(LANE_MID.y, truck.y, FOLLOW) };
    const homeX = mobile ? lerp(NETWORK_MAP.center.x, LANE_MID.x, FRAMES.mobile.bias) : NETWORK_MAP.center.x;
    const focusX = lerp(lerp(homeX, LANE_MID.x, lane), follow.x, track);
    const focusY = lerp(lerp(NETWORK_MAP.center.y, LANE_MID.y, lane), follow.y, track);
    const zoom = lerp(lerp(ZOOM.hero, ZOOM.lane, lane), ZOOM.track, track);
    const desktopX = lerp(
        lerp(lerp(FRAMES.desktop.hero, FRAMES.desktop.quote, lane), FRAMES.desktop.book, book),
        FRAMES.desktop.track,
        track,
    );

    return {
        x: focusX,
        y: focusY,
        scale: fit * (mobile ? lerp(1, zoom, MOBILE_ZOOM) : zoom),
        frameX: size.width * (mobile ? FRAMES.mobile.x : desktopX),
        frameY: (size.height * (frame.top + frame.bottom)) / 2,
    };
}

export const toScreen = (point: Point, camera: Camera): Point => ({
    x: camera.frameX + (point.x - camera.x) * camera.scale,
    y: camera.frameY + (point.y - camera.y) * camera.scale,
});
