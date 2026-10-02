export type Side = "ship" | "haul";

export interface Hub {
    code: string;
    name: string;
    lon: number;
    lat: number;
    major: boolean;
}

export type LonLat = [number, number];

export type Rgb = [number, number, number];

export interface NetworkHub extends Hub {
    position: LonLat;
}

export interface Trip {
    path: LonLat[];
    timestamps: number[];
    accent: boolean;
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
    accent: Rgb;
    muted: Rgb;
    font: string;
}

export interface MapFrame {
    intro: number;
    progress: number;
    time: number;
}

export interface SideCopy {
    headline: readonly string[];
    lead: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
}

export interface NavLinkItem {
    id: string;
    label: string;
    href: string;
}

export interface SceneReadout {
    id: string;
    label: string;
    value: string;
}

export interface LaneSample {
    id: string;
    from: string;
    to: string;
    equipment: string;
    rate: string;
    transit: string;
    onTime: string;
}

export interface Door {
    side: Side;
    label: string;
    title: string;
    points: readonly string[];
    cta: { label: string; href: string };
}

export interface FooterGroup {
    id: string;
    label: string;
    links: readonly NavLinkItem[];
}

export interface TargetFigure {
    id: string;
    value: number;
    unit: string;
    label: string;
}

export interface ConsoleLoad {
    id: string;
    lane: string;
    status: string;
    tone: "live" | "done" | "idle";
    eta: string;
    rate: string;
    progress: number;
}

export interface DriverStep {
    id: string;
    label: string;
    done: boolean;
}

export interface PayTerm {
    id: string;
    label: string;
    days: number;
    value: string;
    featured: boolean;
}

export interface EnterpriseItem {
    id: string;
    title: string;
    body: string;
}

export type LonLatAlt = [number, number, number];

export interface QuoteLane {
    from: NetworkHub;
    to: NetworkHub;
}

export interface LaneDraft {
    origin: string;
    destination: string;
}
