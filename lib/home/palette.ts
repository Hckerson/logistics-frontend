import type { MapPalette, Rgb, Rgba } from "@/lib/types";
import { rgbOf } from "@/lib/utils/css-color";

const FALLBACK: Rgb = [128, 128, 128];

export const OPAQUE = 255;

export const tint = (colour: Rgb, alpha: number): Rgba => [...colour, Math.round(alpha)];

export function paletteOf(element: HTMLElement): MapPalette {
    const styles = getComputedStyle(element);
    const token = (name: string) => rgbOf(styles.getPropertyValue(name)) ?? FALLBACK;

    return {
        land: token("--haulr-land"),
        stateLine: token("--haulr-state-line"),
        road: token("--haulr-road"),
        headlight: token("--haulr-headlight"),
        hot: token("--haulr-hot"),
        accent: token("--colors-accent"),
        muted: token("--colors-text-muted"),
        font: styles.fontFamily,
    };
}
