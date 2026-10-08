import type { LayerExtension } from "@deck.gl/core";

export type LonLat = [number, number];

export type LonLatAlt = [number, number, number];

export type Rgb = [number, number, number];

export type Rgba = [number, number, number, number];

export interface Trip {
    path: LonLat[];
    timestamps: number[];
    accent: boolean;
}

export interface Route {
    path: LonLat[] | LonLatAlt[];
    timestamps: number[];
}

export interface HubArc {
    from: LonLat;
    to: LonLat;
}

export interface FlightView {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
}

export interface MapPalette {
    land: Rgb;
    stateLine: Rgb;
    road: Rgb;
    headlight: Rgb;
    hot: Rgb;
    accent: Rgb;
    muted: Rgb;
    font: string;
}

export interface MapFrame {
    intro: number;
    progress: number;
    time: number;
}

export type GlowProfile = {
    shape: "line" | "dot";
    core: number;
    halo: number;
    spread: number;
    heat: number;
    tip?: number;
    taper?: number;
};

export type GlowOptions = GlowProfile & { hot: Rgb };

export type GlowName = "line" | "trail" | "lane" | "arc" | "travelled" | "dot" | "hub" | "beam";

export type Glows = Record<GlowName, LayerExtension<GlowOptions>>;
