import { appRoutes } from "@/lib/app-routes";
import { TIME_MS } from "@/lib/constants";
import type { FleetEntryDto, FleetPlanDto, FleetTruckDto, FleetWindowDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { FLEET } from "@/lib/fleet/constants";
import { addDays, dayOf } from "@/lib/fleet/time";
import { stopWindow } from "@/lib/loads/view";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { dayName } from "@/lib/tracking/view";
import type { PlacedItem, PlanItem, PlanRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

const { grid } = FLEET_COPY;

export const truckName = ({ unit }: Pick<FleetTruckDto, "unit">) => fillTemplate(FLEET_COPY.unit, { unit });

export const dayLabel = (day: string) => dayName(`${day}T12:00:00Z`, "UTC");

export const shiftWeek = (weekStart: string, weeks: number) => addDays(weekStart, weeks * FLEET.weekDays);

export const spanOfItem = (item: PlanItem) => {
    if (item.kind === "entry") return { from: item.entry.pickupStart, to: item.entry.deliveryEnd };
    return item.kind === "unavailable" ? item.period : item.window;
};

const keyOf = (item: PlanItem) => (item.kind === "entry" ? item.entry.loadId : item.kind === "unavailable" ? item.period.id : item.window.id);

const place = (items: readonly PlanItem[], days: readonly string[], timeZone: string): PlacedItem[] => {
    const first = days[0];
    const last = days[days.length - 1];
    const ends: number[] = [];
    return items
        .map((item) => {
            const { from, to } = spanOfItem(item);
            return { item, from: dayOf(Date.parse(from), timeZone), to: dayOf(Date.parse(to) - TIME_MS.minute, timeZone) };
        })
        .filter(({ from, to }) => from <= last && to >= first)
        .map(({ item, from, to }) => ({ item, start: from < first ? 0 : days.indexOf(from), end: to > last ? days.length - 1 : days.indexOf(to) }))
        .sort((one, other) => one.start - other.start || other.end - one.end)
        .map(({ item, start, end }) => {
            const free = ends.findIndex((taken) => taken < start);
            const lane = free === -1 ? ends.length : free;
            ends[lane] = end;
            return { key: keyOf(item), item, start, span: end - start + 1, lane };
        });
};

const rowOf = (plan: FleetPlanDto, key: string, row: FleetPlanDto["rows"][number] | null, items: readonly PlanItem[]): PlanRow => {
    const placed = place(items, plan.days, plan.timeZone);
    return { key, truck: row?.truck ?? null, row, items: placed, lanes: Math.max(1, ...placed.map(({ lane }) => lane + 1)) };
};

export const UNASSIGNED_ROW = "unassigned";

export const planRows = (plan: FleetPlanDto): PlanRow[] => [
    ...(plan.unassigned.length > 0 ? [rowOf(plan, UNASSIGNED_ROW, null, plan.unassigned.map((entry) => ({ kind: "entry" as const, entry })))] : []),
    ...plan.rows.map((row) =>
        rowOf(plan, row.truck.id, row, [
            ...row.entries.map((entry) => ({ kind: "entry" as const, entry })),
            ...row.unavailable.map((period) => ({ kind: "unavailable" as const, period })),
            ...row.windows.map((window) => ({ kind: "window" as const, window })),
        ]),
    ),
];

export const cellItems = (row: PlanRow, day: number) => row.items.filter(({ start }) => start === day).sort((one, other) => one.lane - other.lane);

export const timeOrdered = (items: readonly PlacedItem[]) =>
    [...items].sort((one, other) => Date.parse(spanOfItem(one.item).from) - Date.parse(spanOfItem(other.item).from));

export const entryLabel = (entry: FleetEntryDto) =>
    fillTemplate(grid.entry, {
        load: entry.loadId,
        origin: `${entry.origin.city}, ${entry.origin.region}`,
        destination: `${entry.destination.city}, ${entry.destination.region}`,
        pickup: stopWindow({ windowStart: entry.pickupStart, windowEnd: entry.pickupEnd, facility: { timeZone: entry.timeZone } }),
        status: LOAD_STATUS_LABELS[entry.status],
        driver: entry.driverName ?? grid.noDriver,
    });

const overlapping = (one: FleetEntryDto, other: FleetEntryDto) =>
    Date.parse(one.pickupStart) < Date.parse(other.deliveryEnd) && Date.parse(other.pickupStart) < Date.parse(one.deliveryEnd);

export const moveVerdict = (entry: FleetEntryDto, from: PlanRow, target: PlanRow) => {
    const truck = target.truck;
    if (!truck) return { valid: false, message: "" };
    const name = truckName(truck);
    if (target.key === from.key) return { valid: false, message: fillTemplate(grid.sameTruck, { load: entry.loadId, truck: name }) };
    if (truck.equipment !== entry.equipment) {
        const [has, needs] = [truck.equipment, entry.equipment].map((kind) => LOAD_COPY.equipment[kind].toLowerCase());
        return { valid: false, message: fillTemplate(grid.equipment, { truck: name, has, load: entry.loadId, needs }) };
    }
    const clash = target.row?.entries.find((other) => other.loadId !== entry.loadId && overlapping(other, entry));
    if (clash) return { valid: false, message: fillTemplate(grid.overlap, { truck: name, other: clash.loadId }) };
    return { valid: true, message: fillTemplate(grid.target, { truck: name, load: entry.loadId }) };
};

export const windowSearch = (window: FleetWindowDto, equipment: FleetTruckDto["equipment"], back: string) =>
    `${appRoutes.loadBoard()}${queryString({
        origin: `${window.city}, ${window.region}`,
        originRadius: FLEET.searchRadiusMiles,
        from: window.from,
        to: window.to,
        equipment,
        next: back,
    })}`;

export const nextDays = (now: number, timeZone: string) => Array.from({ length: FLEET.phoneDays }, (_, index) => addDays(dayOf(now, timeZone), index));

export const withinDays = (item: PlanItem, days: readonly string[], timeZone: string) => {
    const { from, to } = spanOfItem(item);
    return dayOf(Date.parse(from), timeZone) <= days[days.length - 1] && dayOf(Date.parse(to) - TIME_MS.minute, timeZone) >= days[0];
};
