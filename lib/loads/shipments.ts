import type { LoadCountDto, LoadSummaryDto, StopPlaceDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { LOAD_STATUSES } from "@/lib/enums/load-status";
import { TRACKED_STATUSES, TRACKING } from "@/lib/loads/constants";
import { LOAD_STATUS_TONES } from "@/lib/loads/status";
import { minutesSince } from "@/lib/loads/tracking";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import type { LoadListParams, LoadQualifier, LoadStatus, ShipmentFilters, ShipmentStage, SignalTone } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

export const SHIPMENT_STAGES = ["all", "moving", "waiting", "attention", "done", "ended"] as const;

export const NO_SHIPMENT_FILTERS: ShipmentFilters = { stage: "all", q: "", equipment: null, late: false };

const STAGE_TONES: Record<Exclude<ShipmentStage, "all">, readonly SignalTone[]> = {
    moving: ["live"],
    waiting: ["neutral"],
    attention: ["warning", "danger"],
    done: ["success"],
    ended: ["muted"],
};

export const stageStatuses = (stage: ShipmentStage): readonly LoadStatus[] =>
    stage === "all" ? LOAD_STATUSES : LOAD_STATUSES.filter((status) => STAGE_TONES[stage].includes(LOAD_STATUS_TONES[status]));

export const stageCount = (stage: ShipmentStage, counts: readonly LoadCountDto[]) => {
    const statuses = stageStatuses(stage);
    return counts.reduce((sum, entry) => (statuses.includes(entry.status) ? sum + entry.count : sum), 0);
};

export const listParams = ({ stage, q, equipment, late }: ShipmentFilters): LoadListParams => ({
    status: stage === "all" ? undefined : stageStatuses(stage).join(","),
    q: q || undefined,
    equipment: equipment ?? undefined,
    late: late || undefined,
});

export const refinements = ({ q, equipment, late }: ShipmentFilters) => [q, equipment, late].filter(Boolean).length;

export const shipmentQuery = ({ stage, q, equipment, late }: ShipmentFilters) =>
    queryString({ stage: stage === "all" ? undefined : stage, q: q || undefined, equipment: equipment ?? undefined, late: late || undefined });

export const shipmentQualifier = (load: LoadSummaryDto, now: number): LoadQualifier | undefined => {
    if (load.eta?.late) return "late";
    const tracked = TRACKED_STATUSES.includes(load.status);
    return tracked && load.lastPositionAt && minutesSince(load.lastPositionAt, now) > TRACKING.staleMinutes ? "stale" : undefined;
};

export const placeLabel = ({ city, region }: Pick<StopPlaceDto, "city" | "region">) => `${city}, ${region}`;

export const shortMoment = (iso: string, timeZone: string) =>
    fillTemplate(SHIPMENTS_COPY.moment, { day: dayName(iso, timeZone), time: shortTime(iso, timeZone) });

export const placeWindow = ({ windowStart, windowEnd, timeZone }: StopPlaceDto) =>
    `${shortMoment(windowStart, timeZone)}–${clockTime(windowEnd, timeZone)}`;
