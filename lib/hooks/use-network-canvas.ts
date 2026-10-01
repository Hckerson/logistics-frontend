import { useEffect, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { DPR_MAX } from "@/lib/home/constants";
import { renderNetwork } from "@/lib/home/render";
import type { DampedPointer, NetworkPalette, Point } from "@/lib/types";

interface Options {
    progress: MotionValue<number>;
    intro: MotionValue<number>;
    pointer: DampedPointer;
    price: RefObject<HTMLElement | null>;
    truck: RefObject<HTMLElement | null>;
}

const paletteOf = (canvas: HTMLCanvasElement): NetworkPalette => {
    const styles = getComputedStyle(canvas);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    return {
        ground: token("--colors-background"),
        line: token("--haulr-network"),
        hub: token("--haulr-hub"),
        muted: token("--colors-text-muted"),
        accent: token("--colors-accent"),
        band: token("--haulr-band"),
        font: styles.fontFamily,
    };
};

const place = (element: HTMLElement | null, point: Point) => {
    if (element) element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
};

export function useNetworkCanvas(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    { progress, intro, pointer, price, truck }: Options,
) {
    const { x, y, presence } = pointer;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const palette = paletteOf(canvas);
        const size = { width: 0, height: 0 };
        let visible = true;
        let frameId = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio, DPR_MAX);
            size.width = rect.width;
            size.height = rect.height;
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (time: number) => {
            frameId = requestAnimationFrame(draw);
            if (!visible || document.hidden || size.width === 0) return;
            const anchors = renderNetwork(
                ctx,
                size,
                {
                    intro: intro.get(),
                    progress: progress.get(),
                    pointer: { x: x.get(), y: y.get(), presence: presence.get() },
                    time,
                },
                palette,
            );
            place(price.current, anchors.price);
            place(truck.current, anchors.truck);
        };

        const resizer = new ResizeObserver(resize);
        const watcher = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        });
        resizer.observe(canvas);
        watcher.observe(canvas);
        resize();
        frameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frameId);
            resizer.disconnect();
            watcher.disconnect();
        };
    }, [canvasRef, progress, intro, x, y, presence, price, truck]);
}
