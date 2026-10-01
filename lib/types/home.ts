import type { MotionValue } from "motion/react";

export type Side = "ship" | "haul";

export interface Hub {
    code: string;
    name: string;
    lon: number;
    lat: number;
    major: boolean;
}

export interface Point {
    x: number;
    y: number;
}

export interface NetworkHub extends Hub, Point {
    delay: number;
}

export interface StageSize {
    width: number;
    height: number;
}

export interface NetworkLane {
    from: NetworkHub;
    to: NetworkHub;
    delay: number;
}

export interface Camera {
    x: number;
    y: number;
    scale: number;
    frameX: number;
    frameY: number;
}

export interface NetworkPalette {
    ground: string;
    line: string;
    hub: string;
    muted: string;
    accent: string;
    band: string;
    font: string;
}

export interface NetworkFrame {
    intro: number;
    progress: number;
    pointer: Point & { presence: number };
    time: number;
}

export interface NetworkAnchors {
    price: Point;
    truck: Point;
}

export interface DampedPointer {
    x: MotionValue<number>;
    y: MotionValue<number>;
    presence: MotionValue<number>;
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
