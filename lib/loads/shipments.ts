import { TIME_MS } from "@/lib/constants";
import type { LoadCountDto, LoadExportFiltersDto, LoadSummaryDto, StopPlaceDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { LOAD_STATUSES } from "@/lib/enums/load-status";
import { TRACKED_STATUSES, TRACKING } from "@/lib/loads/constants";
import { LOAD_STATUS_TONES } from "@/lib/loads/status";
import { minutesSince } from "@/lib/loads/tracking";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import type { LoadListParams, LoadQualifier, LoadSort, LoadStatus, ShipmentFilters, ShipmentStage, SignalTone, TableSort } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

export const SHIPMENT_STAGES = ["all", "moving", "waiting", "attention", "done", "ended"] as const;

export const SHIPMENT_VIEWS = ["list", "map"] as const;

export const LOAD_SORTS = ["pickup", "-pickup", "delivery", "-delivery", "updated", "-updated"] as const satisfies readonly NonNullable<LoadListParams["sort"]>[];

export const LOAD_DATE_FIELDS = ["pickup", "delivery"] as const satisfies readonly NonNullable<LoadListParams["dateField"]>[];

export const LOAD_FILTER_LIMITS = { place: 120, party: 64, ids: 100, exportIds: 500 } as const;

export const EXPORT_RULES = { instantRows: 100, pollMs: { quick: TIME_MS.second, job: 10 * TIME_MS.second }, settled: ["ready", "failed", "expired"] } as const;

export const NO_SHIPMENT_FILTERS: ShipmentFilters = {
    stage: "all",
    q: "",
    equipment: [],
    late: false,
    exceptions: false,
    from: null,
    to: null,
    dateField: "pickup",
    origin: null,
    destination: null,
    carrier: null,
    sort: null,
    view: "list",
};

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

const sameSet = (statuses: readonly string[], wanted: ReadonlySet<string>) => statuses.length === wanted.size && statuses.every((status) => wanted.has(status));

export const stageOf = (value: string) => {
    const wanted = new Set(value.split(",").filter(Boolean));
    return SHIPMENT_STAGES.find((stage) => stage !== "all" && sameSet(stageStatuses(stage), wanted)) ?? value;
};

const dated = ({ from, to, dateField }: ShipmentFilters) => ({ from: from ?? undefined, to: to ?? undefined, dateField: from || to ? dateField : undefined });

export const listParams = (filters: ShipmentFilters): LoadListParams => ({
    status: filters.stage === "all" ? undefined : stageStatuses(filters.stage).join(","),
    q: filters.q || undefined,
    equipment: filters.equipment.length ? filters.equipment.join(",") : undefined,
    late: filters.late || undefined,
    exceptions: filters.exceptions || undefined,
    ...dated(filters),
    origin: filters.origin ?? undefined,
    destination: filters.destination ?? undefined,
    carrier: filters.carrier ?? undefined,
    sort: filters.sort ?? undefined,
});

export const refinements = ({ q, equipment, late, exceptions, from, to, origin, destination, carrier }: ShipmentFilters) =>
    [q, equipment.length > 0, late, exceptions, from || to, origin, destination, carrier].filter(Boolean).length;

export const shipmentQuery = (filters: ShipmentFilters) => queryString({ ...listParams(filters), view: filters.view === "map" ? filters.view : undefined });

export const exportFilters = (filters: ShipmentFilters): LoadExportFiltersDto => {
    const { status, equipment, q, late, from, to, dateField, origin, destination, carrier, exceptions } = listParams(filters);
    return { status, equipment, q, late, from, to, dateField, origin, destination, carrier, exceptions };
};

export const tableSort = (sort: LoadSort | null): TableSort | undefined =>
    sort ? { column: sort.replace("-", ""), direction: sort.startsWith("-") ? "descending" : "ascending" } : undefined;

export const loadSort = ({ column, direction }: TableSort): LoadSort | null =>
    LOAD_SORTS.find((sort) => sort === (direction === "descending" ? `-${column}` : column)) ?? null;

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
