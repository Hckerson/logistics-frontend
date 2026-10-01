import type { NetworkFrame, NetworkPalette, Point, StageSize } from "@/lib/types";
import { NETWORK } from "@/lib/home/constants";
import { controlPoint, distance, pointOnCurve } from "@/lib/home/geometry";
import { clamp, ramp, smootherstep } from "@/lib/home/math";
import { NETWORK_MAP } from "@/lib/home/network";

type Project = (point: Point) => Point;

const SPREAD = 0.45;
const LANE_WINDOW = 0.4;
const HUB_WINDOW = 0.25;
const LABEL_OFFSET = { x: 9, y: 3 };
const HUB_RADIUS = { major: 2.8, minor: 1.9, boost: 3 };
const LABEL_FONT_SIZE = 10;
const LABEL_NEAR = 0.4;
const ACCENT_NEAR = 0.05;

const revealOf = (intro: number, delay: number, window: number) =>
    smootherstep(ramp(intro, delay * SPREAD, delay * SPREAD + window));

export function strokeCurve(
    ctx: CanvasRenderingContext2D,
    project: Project,
    from: Point,
    control: Point,
    to: Point,
    start: number,
    end: number,
) {
    if (end <= start) return;
    ctx.beginPath();
    for (let step = 0; step <= NETWORK.samples; step++) {
        const t = start + ((end - start) * step) / NETWORK.samples;
        const point = project(pointOnCurve(from, control, to, t));
        if (step === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
}

export function drawNetwork(
    ctx: CanvasRenderingContext2D,
    project: Project,
    frame: NetworkFrame,
    palette: NetworkPalette,
    size: StageSize,
) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = palette.line;
    for (const lane of NETWORK_MAP.lanes) {
        const reveal = revealOf(frame.intro, lane.delay, LANE_WINDOW);
        const control = controlPoint(lane.from, lane.to, NETWORK.bend);
        strokeCurve(ctx, project, lane.from, control, lane.to, 0, reveal);
    }

    const pointer = {
        x: ((frame.pointer.x + 1) / 2) * size.width,
        y: ((frame.pointer.y + 1) / 2) * size.height,
    };
    const reach = NETWORK.pointerRadius * size.width;
    ctx.font = "500 " + LABEL_FONT_SIZE + "px " + palette.font;

    for (const hub of NETWORK_MAP.hubs) {
        const appear = revealOf(frame.intro, hub.delay, HUB_WINDOW);
        if (appear <= 0) continue;
        const point = project(hub);
        const near = frame.pointer.presence * (1 - clamp(distance(point, pointer) / reach));
        const base = hub.major ? HUB_RADIUS.major : HUB_RADIUS.minor;

        ctx.globalAlpha = appear;
        ctx.fillStyle = near > ACCENT_NEAR ? palette.accent : palette.hub;
        ctx.beginPath();
        ctx.arc(point.x, point.y, base + near * HUB_RADIUS.boost, 0, Math.PI * 2);
        ctx.fill();

        if (hub.major || near > LABEL_NEAR) {
            ctx.fillStyle = palette.muted;
            ctx.fillText(hub.code, point.x + LABEL_OFFSET.x, point.y + LABEL_OFFSET.y);
        }
    }
    ctx.globalAlpha = 1;
}
