import type { NetworkAnchors, NetworkFrame, NetworkPalette, Point, StageSize } from "@/lib/types";
import { cameraAt, toScreen } from "@/lib/home/camera";
import { drawLoad, truckAt } from "@/lib/home/draw-load";
import { drawNetwork } from "@/lib/home/draw-network";
import { drawVeil } from "@/lib/home/draw-veil";
import { pointOnCurve } from "@/lib/home/geometry";
import { NETWORK_MAP } from "@/lib/home/network";

const { origin, control, destination } = NETWORK_MAP;
const LANE_MID = pointOnCurve(origin, control, destination, 0.5);

export function renderNetwork(
    ctx: CanvasRenderingContext2D,
    size: StageSize,
    frame: NetworkFrame,
    palette: NetworkPalette,
): NetworkAnchors {
    const truck = pointOnCurve(origin, control, destination, truckAt(frame.progress));
    const camera = cameraAt(frame.progress, truck, size);
    const project = (point: Point) => toScreen(point, camera);

    ctx.clearRect(0, 0, size.width, size.height);
    drawNetwork(ctx, project, frame, palette, size);
    drawVeil(ctx, camera, size);
    drawLoad(ctx, project, camera, frame, palette);

    return { price: project(LANE_MID), truck: project(truck) };
}
