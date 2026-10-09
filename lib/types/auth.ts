export type AccountSide = "shipper" | "carrier";

export type SignInField = "email" | "password";

export type AccountField = "side" | "fullName" | "email" | "password" | "consent";

export type ManifestField = "fullName" | "email" | "password";

export type SignInStep = "email" | "password";

export type RegisterStep = "side" | "details";

export type ResetStep = "email" | "sent";

export type OutcomeTone = "accent" | "pending" | "error";

export type AuthSignal = "origin" | "midway" | "pending" | "arrived" | "held";

export interface AuthLink {
    id: string;
    label: string;
    href: string;
}

export interface FormProblem {
    field?: AccountField;
    message: string;
    links?: readonly AuthLink[];
}

export interface Credentials {
    email: string;
    password: string;
}

export interface AccountDraft {
    side: AccountSide | null;
    fullName: string;
    email: string;
    password: string;
    consent: boolean;
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
    midway: number;
}

export interface LaneTag {
    title: string;
    route: string;
    status: Record<AuthSignal, string>;
    rolling: string;
}
