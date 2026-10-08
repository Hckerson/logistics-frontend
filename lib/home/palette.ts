import type { MapPalette, Rgb, Rgba } from "@/lib/types";

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const FALLBACK: Rgb = [128, 128, 128];

export const OPAQUE = 255;

export const tint = (colour: Rgb, alpha: number): Rgba => [...colour, Math.round(alpha)];

const rgbOf = (value: string): Rgb => {
    const match = HEX.exec(value.trim());
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : FALLBACK;
};

export function paletteOf(element: HTMLElement): MapPalette {
    const styles = getComputedStyle(element);
    const token = (name: string) => rgbOf(styles.getPropertyValue(name));

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
