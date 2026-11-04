import type { Rgb } from "@/lib/types";

let probe: CanvasRenderingContext2D | null = null;

const probeContext = () =>
    (probe ??= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true }));

export function rgbOf(colour: string): Rgb | null {
    const context = probeContext();
    if (!context || !CSS.supports("color", colour)) return null;

    context.clearRect(0, 0, 1, 1);
    context.fillStyle = colour;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return [red, green, blue];
}
