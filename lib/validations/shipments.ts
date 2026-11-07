import { z } from "zod";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_SEARCH_MAX } from "@/lib/loads/constants";
import { LOAD_DATE_FIELDS, LOAD_FILTER_LIMITS, LOAD_SORTS, SHIPMENT_STAGES, SHIPMENT_VIEWS, stageOf } from "@/lib/loads/shipments";

const commaList = <T extends z.ZodType<unknown, string>>(item: T) =>
    z
        .string()
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(z.array(item).min(1));

const place = z.string().trim().min(1).max(LOAD_FILTER_LIMITS.place);

export const shipmentParamSchema = z.object({
    status: z.string().transform(stageOf).pipe(z.enum(SHIPMENT_STAGES)),
    q: z.string().trim().max(LOAD_SEARCH_MAX),
    equipment: commaList(z.enum(EQUIPMENT_TYPES)),
    late: z.literal("true"),
    exceptions: z.literal("true"),
    from: z.iso.date(),
    to: z.iso.date(),
    dateField: z.enum(LOAD_DATE_FIELDS),
    origin: place,
    destination: place,
    carrier: z.string().trim().min(1).max(LOAD_FILTER_LIMITS.party),
    sort: z.enum(LOAD_SORTS),
    view: z.enum(SHIPMENT_VIEWS),
});

export const shipmentFiltersSchema = z.object({
    stage: z.enum(SHIPMENT_STAGES),
    q: z.string(),
    equipment: z.array(z.enum(EQUIPMENT_TYPES)),
    late: z.boolean(),
    exceptions: z.boolean(),
    from: z.iso.date().nullable(),
    to: z.iso.date().nullable(),
    dateField: z.enum(LOAD_DATE_FIELDS),
    origin: z.string().nullable(),
    destination: z.string().nullable(),
    carrier: z.string().nullable(),
    sort: z.enum(LOAD_SORTS).nullable(),
    view: z.enum(SHIPMENT_VIEWS),
});
