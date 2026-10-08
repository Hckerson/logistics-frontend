import { WebMercatorViewport } from "@deck.gl/core";
import type { FlightView, LonLat, MapTagId } from "@/lib/types";
import { NETWORK_HUBS } from "@/lib/home/trips";

const HUB_POSITIONS = new Map(NETWORK_HUBS.map((hub) => [hub.code, hub.position]));

export const viewportOf = (view: FlightView, canvas: HTMLCanvasElement) =>
    new WebMercatorViewport({ ...view, width: canvas.clientWidth, height: canvas.clientHeight });

export function pin(element: HTMLElement, viewport: WebMercatorViewport, position: LonLat, opacity: number) {
    const [px, py, pz] = viewport.projectPosition([position[0], position[1], 0]);
    const matrix = viewport.viewProjectionMatrix;
    const ahead = matrix[3] * px + matrix[7] * py + matrix[11] * pz + matrix[15] > 0;
    const [x, y] = viewport.project(position);
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    element.style.opacity = ahead ? String(opacity) : "0";
}

export function pinLabels(container: HTMLElement | null, viewport: WebMercatorViewport, opacity: number) {
    container?.querySelectorAll<HTMLElement>("[data-hub]").forEach((label) => {
        const position = HUB_POSITIONS.get(label.dataset.hub ?? "");
        if (position) pin(label, viewport, position, opacity);
    });
}

export function pinTags(container: HTMLElement | null, viewport: WebMercatorViewport, anchors: Record<MapTagId, LonLat>) {
    container?.querySelectorAll<HTMLElement>("[data-pin]").forEach((tag) => {
        const position = anchors[tag.dataset.pin as MapTagId];
        if (position) pin(tag, viewport, position, 1);
    });
}
