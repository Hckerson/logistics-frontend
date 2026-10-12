import { LANE_FIELDS } from "@/lib/quotes/constants";
import type { LaneEntry, LaneField } from "@/lib/types";

export const laneParams = (search: Record<string, string | string[] | undefined>): Partial<LaneEntry> =>
    Object.fromEntries(
        LANE_FIELDS.flatMap((field): [LaneField, string][] => {
            const value = search[field];
            return typeof value === "string" ? [[field, value]] : [];
        }),
    );
