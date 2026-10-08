export type SignInField = "email" | "password";

export interface FormProblem {
    field?: SignInField;
    message: string;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface AuthLink {
    id: string;
    label: string;
    href: string;
}

export type LanePoint = [number, number];

export interface LaneHub {
    code: string;
    at: LanePoint;
    stop: boolean;
    major: boolean;
}

export interface LaneRun {
    d: string;
    dash: number;
    duration: number;
    delay: number;
}

export interface LaneArtData {
    width: number;
    height: number;
    route: string;
    points: LanePoint[];
    times: readonly number[];
    roads: string;
    traffic: LaneRun[];
    hubs: LaneHub[];
}

export interface LaneTag {
    title: string;
    route: string;
    detail: string;
}
