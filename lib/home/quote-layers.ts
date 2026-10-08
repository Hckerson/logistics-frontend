import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Glows, MapPalette, NetworkHub, QuoteLane, Route, Trip } from "@/lib/types";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { MAP_DOT, MAP_WIDTH, QUOTE_MAP } from "@/lib/home/map-constants";
import { baseLayers } from "@/lib/home/base-layers";
import { GlowTripsLayer } from "@/lib/home/glow";
import { OPAQUE, tint } from "@/lib/home/palette";
import { laneBetween } from "@/lib/home/quote-map";
import { arcRoute } from "@/lib/home/routes";

interface Frame {
    time: number;
    lane: QuoteLane | null;
    drawn: number;
}

const { origin, destination } = CLOSE_COPY.fields;
const WARM_LANE = laneBetween(origin.placeholder, destination.placeholder);
const SHOWN = { land: 1, network: 1, traffic: 1 };

export function quoteLayers(trips: Trip[], palette: MapPalette, frame: Frame, glows: Glows): Layer[] {
    const shown = frame.lane ?? WARM_LANE;
    const opacity = frame.lane ? 1 : 0;
    const ends = shown ? [shown.from, shown.to] : [];
    const arc = shown
        ? [arcRoute(shown.from.position, shown.to.position, frame.lane ? frame.drawn : 1, QUOTE_MAP.arcHeight)]
        : [];

    return [
        ...baseLayers("quote-", trips, palette, frame.time, glows, SHOWN),
        new GlowTripsLayer<Route>({
            id: "quote-arc",
            data: arc,
            getPath: (route) => route.path,
            getTimestamps: (route) => route.timestamps,
            getColor: tint(palette.accent, OPAQUE),
            currentTime: 1,
            trailLength: 1,
            fadeTrail: false,
            widthMinPixels: MAP_WIDTH.lane,
            capRounded: true,
            jointRounded: true,
            billboard: true,
            opacity,
            extensions: [glows.arc],
        }),
        new ScatterplotLayer<NetworkHub>({
            id: "quote-ends",
            data: ends,
            getPosition: (hub) => hub.position,
            getRadius: MAP_DOT.terminal,
            getFillColor: tint(palette.accent, OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
            opacity,
            extensions: [glows.dot],
        }),
    ];
}
