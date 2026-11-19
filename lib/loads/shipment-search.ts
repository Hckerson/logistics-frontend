import type { z } from "zod";
import type { PartyDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { NO_SHIPMENT_FILTERS } from "@/lib/loads/shipments";
import type { AppliedFilter, ShipmentFilters, ShipmentParam } from "@/lib/types";
import { formatBound, toDateValue } from "@/lib/utils/date-value";
import { fillTemplate } from "@/lib/utils/fill-template";
import { shipmentParamSchema } from "@/lib/validations/shipments";

type SearchParams = Record<string, string | string[] | undefined>;

const { chips, dates } = SHIPMENTS_COPY;
const EXPORT_ID = /^[\w-]{1,64}$/;

export const parseShipmentSearch = (raw: SearchParams) => {
    const reset: ShipmentParam[] = [];
    const read = <T,>(key: ShipmentParam, schema: z.ZodType<T>) => {
        const value = raw[key];
        if (value === undefined) return null;
        const parsed = schema.safeParse(value);
        if (!parsed.success) reset.push(key);
        return parsed.success ? parsed.data : null;
    };
    const { shape } = shipmentParamSchema;
    let from = read("from", shape.from);
    let to = read("to", shape.to);
    if (from && to && from > to) {
        reset.push("from", "to");
        from = null;
        to = null;
    }

    const filters: ShipmentFilters = {
        stage: read("status", shape.status) ?? NO_SHIPMENT_FILTERS.stage,
        q: read("q", shape.q) ?? NO_SHIPMENT_FILTERS.q,
        equipment: read("equipment", shape.equipment) ?? NO_SHIPMENT_FILTERS.equipment,
        late: read("late", shape.late) !== null,
        exceptions: read("exceptions", shape.exceptions) !== null,
        from,
        to,
        dateField: read("dateField", shape.dateField) ?? NO_SHIPMENT_FILTERS.dateField,
        origin: read("origin", shape.origin),
        destination: read("destination", shape.destination),
        carrier: read("carrier", shape.carrier),
        sort: read("sort", shape.sort),
        view: read("view", shape.view) ?? NO_SHIPMENT_FILTERS.view,
        batch: read("batch", shape.batch),
    };
    const job = raw.export;
    const exportId = typeof job === "string" && EXPORT_ID.test(job) ? job : null;
    return { filters, reset, exportId };
};

const day = (value: string | null) => {
    const date = toDateValue(value, null);
    return date ? formatBound(date, null) : "";
};

const dateChip = ({ from, to, dateField }: ShipmentFilters) => {
    const field = dates.field[dateField];
    if (from && to) return fillTemplate(chips.between, { field, from: day(from), to: day(to) });
    if (from) return fillTemplate(chips.since, { field, from: day(from) });
    return to ? fillTemplate(chips.until, { field, to: day(to) }) : null;
};

export const appliedFilters = (filters: ShipmentFilters, carriers: readonly PartyDto[], batchName: string | null): AppliedFilter[] => {
    const entries: [ShipmentParam, string | null][] = [
        ["equipment", filters.equipment.length ? filters.equipment.map((type) => LOAD_COPY.equipment[type]).join(", ") : null],
        ["from", dateChip(filters)],
        ["origin", filters.origin && fillTemplate(chips.origin, { place: filters.origin })],
        ["destination", filters.destination && fillTemplate(chips.destination, { place: filters.destination })],
        ["carrier", filters.carrier && (carriers.find((carrier) => carrier.id === filters.carrier)?.name ?? filters.carrier)],
        ["late", filters.late ? SHIPMENTS_COPY.lateOnly : null],
        ["exceptions", filters.exceptions ? SHIPMENTS_COPY.exceptionsOnly : null],
        ["batch", filters.batch && fillTemplate(chips.batch, { file: batchName ?? chips.batchUnknown })],
    ];
    return entries.flatMap(([id, label]) => (label ? [{ id, label }] : []));
};

const CLEARED: Partial<Record<ShipmentParam, Partial<ShipmentFilters>>> = {
    equipment: { equipment: [] },
    from: { from: null, to: null },
    origin: { origin: null },
    destination: { destination: null },
    carrier: { carrier: null },
    late: { late: false },
    exceptions: { exceptions: false },
    batch: { batch: null },
};

export const withoutFilter = (id: ShipmentParam): Partial<ShipmentFilters> => CLEARED[id] ?? {};

export const PANEL_CLEARED: Partial<ShipmentFilters> = { equipment: [], from: null, to: null, origin: null, destination: null, carrier: null, exceptions: false };

export const panelCount = ({ equipment, from, to, origin, destination, carrier, exceptions }: ShipmentFilters) =>
    [equipment.length > 0, from || to, origin, destination, carrier, exceptions].filter(Boolean).length;
