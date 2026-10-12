import type { z } from "zod";
import type { routes } from "@/lib/contract/routes";
import type { LoadPositionsDto, PublicTrackingDto } from "@/lib/contract/schemas";
import type { trackingSendSchema } from "@/lib/validations/tracking";

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
