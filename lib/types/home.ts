import type { LonLat } from "@/lib/types/map";

export type Side = "ship" | "haul";

export interface Hub {
    code: string;
    name: string;
    lon: number;
    lat: number;
    major: boolean;
}

export interface NetworkHub extends Hub {
    position: LonLat;
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
}

export interface RecordBeat {
    id: string;
    status: string;
    tone: ConsoleLoad["tone"];
    eta: string;
    done: number;
    action: string;
    pod: string;
    document: string | null;
    caption: string;
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

export interface QuoteLane {
    from: NetworkHub;
    to: NetworkHub;
}

export interface LaneDraft {
    origin: string;
    destination: string;
}
