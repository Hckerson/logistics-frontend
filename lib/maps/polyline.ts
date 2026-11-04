import type { LonLat } from "@/lib/types";

const FACTOR = 1e5;
const OFFSET = 63;
const CHUNK = 0x20;
const MASK = 0x1f;
const BITS = 5;

const encodeValue = (value: number) => {
    let rest = value < 0 ? ~(value << 1) : value << 1;
    let text = "";
    while (rest >= CHUNK) {
        text += String.fromCharCode((CHUNK | (rest & MASK)) + OFFSET);
        rest >>= BITS;
    }
    return text + String.fromCharCode(rest + OFFSET);
};

export const encodePolyline = (path: readonly LonLat[]) => {
    let lat = 0;
    let lon = 0;
    let text = "";
    for (const [pointLon, pointLat] of path) {
        const nextLat = Math.round(pointLat * FACTOR);
        const nextLon = Math.round(pointLon * FACTOR);
        text += encodeValue(nextLat - lat) + encodeValue(nextLon - lon);
        lat = nextLat;
        lon = nextLon;
    }
    return text;
};

export const decodePolyline = (text: string): LonLat[] => {
    const path: LonLat[] = [];
    let index = 0;
    let lat = 0;
    let lon = 0;

    const next = () => {
        let result = 0;
        let shift = 0;
        let byte = CHUNK;
        while (byte >= CHUNK && index < text.length) {
            byte = text.charCodeAt(index++) - OFFSET;
            result |= (byte & MASK) << shift;
            shift += BITS;
        }
        return result & 1 ? ~(result >> 1) : result >> 1;
    };

    while (index < text.length) {
        lat += next();
        lon += next();
        path.push([lon / FACTOR, lat / FACTOR]);
    }
    return path;
};
