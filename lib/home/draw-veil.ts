import type { Camera, StageSize } from "@/lib/types";
import { FRAMES, MOBILE_WIDTH, VEIL } from "@/lib/home/constants";
import { ramp, smootherstep } from "@/lib/home/math";

const SOLID = "rgba(0, 0, 0, 1)";
const CLEAR = "rgba(0, 0, 0, 0)";

const erase = (
    ctx: CanvasRenderingContext2D,
    from: [number, number],
    to: [number, number],
    rect: [number, number, number, number],
    strength: number,
) => {
    if (strength <= 0) return;
    const gradient = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    gradient.addColorStop(0, SOLID);
    gradient.addColorStop(1, CLEAR);
    ctx.globalAlpha = strength;
    ctx.fillStyle = gradient;
    ctx.fillRect(...rect);
    ctx.globalAlpha = 1;
};

export function drawVeil(ctx: CanvasRenderingContext2D, camera: Camera, size: StageSize) {
    const { width, height } = size;
    ctx.globalCompositeOperation = "destination-out";

    if (width < MOBILE_WIDTH) {
        const clear = FRAMES.mobile.top * height;
        const solid = clear - VEIL.mobile * height;
        erase(ctx, [0, solid], [0, clear], [0, 0, width, clear], 1);
    } else {
        const share = camera.frameX / width;
        const copyLeft = smootherstep(ramp(share, VEIL.flip[0], VEIL.flip[1]));
        const leftClear = (share - VEIL.fade) * width;
        const rightClear = (share + VEIL.fade) * width;
        erase(ctx, [(share - VEIL.solid) * width, 0], [leftClear, 0], [0, 0, leftClear, height], copyLeft);
        erase(
            ctx,
            [(share + VEIL.solid) * width, 0],
            [rightClear, 0],
            [rightClear, 0, width - rightClear, height],
            1 - copyLeft,
        );
    }

    ctx.globalCompositeOperation = "source-over";
}
