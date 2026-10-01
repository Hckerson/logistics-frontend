import type { Camera, NetworkFrame, NetworkPalette, Point } from "@/lib/types";
import { BAND, CARRIERS, INTRO, NETWORK, SCENES } from "@/lib/home/constants";
import { strokeCurve } from "@/lib/home/draw-network";
import { normalOnCurve, pointOnCurve } from "@/lib/home/geometry";
import { lerp, ramp, smootherstep } from "@/lib/home/math";
import { NETWORK_MAP } from "@/lib/home/network";

type Project = (point: Point) => Point;

const { origin, control, destination, carriers } = NETWORK_MAP;
const DOT = { terminal: 4.5, truck: 5.5, halo: 13, carrier: 2.4, chosen: 3.6 };
const LANE_WIDTH = { base: 2, travelled: 3.25, under: 9 };
const BAND_POWER = 0.8;
const HALO_ALPHA = 0.2;
const TRACK_INSET = 0.02;
const TRACK_FADE = { before: 0.02, after: 0.03 };
const BOOK_TAIL = 0.04;

const dot = (ctx: CanvasRenderingContext2D, point: Point, radius: number) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
};

export const truckAt = (progress: number) => {
    const linear = ramp(progress, SCENES.track[0] + TRACK_INSET, SCENES.track[1] - TRACK_INSET);
    return lerp(linear, smootherstep(linear), 0.5);
};

function drawBand(ctx: CanvasRenderingContext2D, project: Project, camera: Camera, travelled: number) {
    const reach = BAND.width * (1 - BAND.narrowing * travelled) * camera.scale;
    const left: Point[] = [];
    const right: Point[] = [];
    for (let step = 0; step <= NETWORK.samples; step++) {
        const share = step / NETWORK.samples;
        const t = lerp(travelled, 1, share);
        const centre = project(pointOnCurve(origin, control, destination, t));
        const normal = normalOnCurve(origin, control, destination, t);
        const half = reach * Math.pow(share, BAND_POWER);
        left.push({ x: centre.x + normal.x * half, y: centre.y + normal.y * half });
        right.push({ x: centre.x - normal.x * half, y: centre.y - normal.y * half });
    }
    ctx.beginPath();
    [...left, ...right.reverse()].forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
}

function drawCarriers(ctx: CanvasRenderingContext2D, project: Project, palette: NetworkPalette, progress: number) {
    const book = ramp(progress, SCENES.book[0], SCENES.book[1] - BOOK_TAIL);
    if (book <= 0 || book >= 1) return;
    const settle = smootherstep(book);
    carriers.forEach((carrier, index) => {
        const chosen = index === CARRIERS.chosen;
        const world = chosen
            ? { x: lerp(carrier.x, origin.x, settle), y: lerp(carrier.y, origin.y, settle) }
            : carrier;
        ctx.globalAlpha = chosen ? 1 : Math.sin(Math.PI * book);
        ctx.fillStyle = chosen ? palette.accent : palette.hub;
        dot(ctx, project(world), chosen ? DOT.chosen : DOT.carrier);
    });
    ctx.globalAlpha = 1;
}

function drawTruck(ctx: CanvasRenderingContext2D, point: Point, palette: NetworkPalette, tracking: number) {
    ctx.fillStyle = palette.accent;
    ctx.globalAlpha = HALO_ALPHA * tracking;
    dot(ctx, point, DOT.halo);
    ctx.globalAlpha = tracking;
    dot(ctx, point, DOT.truck);
    ctx.globalAlpha = 1;
}

export function drawLoad(
    ctx: CanvasRenderingContext2D,
    project: Project,
    camera: Camera,
    frame: NetworkFrame,
    palette: NetworkPalette,
) {
    const drawn = smootherstep(ramp(frame.intro, INTRO.laneStart, 1));
    if (drawn <= 0) return;
    const travelled = truckAt(frame.progress);
    const tracking = ramp(
        frame.progress,
        SCENES.track[0] - TRACK_FADE.before,
        SCENES.track[0] + TRACK_FADE.after,
    );

    ctx.lineCap = "round";
    ctx.strokeStyle = palette.band;
    ctx.lineWidth = LANE_WIDTH.under;
    strokeCurve(ctx, project, origin, control, destination, 0, drawn);

    if (tracking > 0) {
        ctx.globalAlpha = tracking;
        ctx.fillStyle = palette.band;
        drawBand(ctx, project, camera, travelled);
        ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = LANE_WIDTH.base;
    strokeCurve(ctx, project, origin, control, destination, 0, drawn);
    ctx.lineWidth = LANE_WIDTH.travelled;
    strokeCurve(ctx, project, origin, control, destination, 0, travelled * tracking);

    drawCarriers(ctx, project, palette, frame.progress);

    ctx.fillStyle = palette.accent;
    dot(ctx, project(origin), DOT.terminal);
    if (drawn >= 1) {
        dot(ctx, project(destination), DOT.terminal);
        ctx.fillStyle = palette.ground;
        dot(ctx, project(destination), DOT.terminal / 2);
    }

    if (tracking > 0) {
        drawTruck(ctx, project(pointOnCurve(origin, control, destination, travelled)), palette, tracking);
    }
}
