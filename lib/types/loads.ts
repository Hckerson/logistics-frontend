import type { z } from "zod";
import type { routes } from "@/lib/contract/routes";
import type { DocumentDto, LoadPositionsDto, PublicTrackingDto } from "@/lib/contract/schemas";
import type { trackingSendSchema } from "@/lib/validations/tracking";
import type { LoadStatus } from "./enums";
import type { SignalTone } from "./ui";

export type TrackingHealth = NonNullable<LoadPositionsDto["health"]>;

export interface TrackingSnapshot {
    data: PublicTrackingDto;
    readAt: number;
}

export type TrackingSendRequest = z.input<typeof trackingSendSchema>;

export type LoadListParams = NonNullable<Parameters<typeof routes.loadsFindAll>[0]>;

export type TimelineParams = NonNullable<Parameters<typeof routes.timelineList>[1]>;

export type PageParams = NonNullable<Parameters<typeof routes.notificationsList>[0]>;

export type TimelineCategory = NonNullable<TimelineParams["category"]>;

export interface StopClock {
    departedAt: string | null;
}

export type LoadQualifier = "late" | "stale";

export interface StatusDisplay {
    label: string;
    tone: SignalTone;
    pulse: boolean;
    stage: number | null;
}

export interface LoadAction {
    to: LoadStatus;
    label: string;
    kind: "move" | "return";
    consequence: string;
    reason: boolean;
    confirm: boolean;
    penalty: boolean;
    destructive: boolean;
}

export type TrackingView = "map" | "text";

export type TimelineFilter = TimelineCategory | "all";

export interface UploadRow {
    key: string;
    file: File;
    type: DocumentDto["type"];
    state: "uploading" | "failed";
    message?: string;
}
