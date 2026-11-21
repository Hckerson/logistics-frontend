import { z } from "zod";
import {
    apiEnvelopeDtoSchema,
    draftFreightDtoSchema,
    draftStopDtoSchema,
    loadDraftDtoSchema,
    loadDraftRequestDtoSchema,
    loadDraftUpdateDtoSchema,
    loadQuoteDtoSchema,
    loadQuoteRequestDtoSchema,
    postLoadRequestDtoSchema,
    postLoadResultDtoSchema,
} from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { POSTING, REQUIREMENTS, typesInOrder, UN_NUMBER, windowsInOrder } from "@/lib/loads/posting";

const isNumber = (text: string) => text.trim() !== "" && Number.isFinite(Number(text));

const future = (iso: string) => Date.parse(iso) > Date.now();

const ordered = (start: string, end: string) => Date.parse(end) > Date.parse(start);

const stopEntrySchema = z.object({
    key: z.string(),
    type: z.enum(["pickup", "delivery"]),
    facilityId: z
        .string()
        .nullable()
        .refine((value) => Boolean(value), "missing"),
    window: z
        .object({ start: z.string(), end: z.string() })
        .nullable()
        .refine((value) => value !== null, "missing")
        .refine((value) => !value || future(value.start), "past")
        .refine((value) => !value || ordered(value.start, value.end), "order"),
    reference: z.string().trim().max(POSTING.reference, "long"),
    instructions: z.string().trim().max(POSTING.instructions, "long"),
});

export const laneEntriesSchema = z
    .object({ stops: z.array(stopEntrySchema).min(POSTING.stops.min, "few").max(POSTING.stops.max, "many") })
    .superRefine(({ stops }, ctx) => {
        if (!typesInOrder(stops.map((stop) => stop.type))) ctx.addIssue({ code: "custom", path: ["stops"], message: "sequence" });
        stops.forEach((stop, index) => {
            const before = stops[index - 1]?.window;
            if (stop.window && before && Date.parse(stop.window.start) < Date.parse(before.start)) {
                ctx.addIssue({ code: "custom", path: ["stops", index, "window"], message: "before" });
            }
        });
    });

const tempIssue = (min: string, max: string) => {
    if (!isNumber(min) || !isNumber(max)) return "temp";
    const [low, high] = [Number(min), Number(max)];
    if (low < POSTING.tempF.min || high > POSTING.tempF.max) return "tempRange";
    return low > high ? "tempOrder" : null;
};

export const freightEntriesSchema = z
    .object({
        equipment: z
            .enum(EQUIPMENT_TYPES)
            .nullable()
            .refine((value) => value !== null, "missing"),
        commodity: z.string().trim().min(1, "missing").max(POSTING.commodity, "long"),
        weightLb: z
            .string()
            .trim()
            .min(1, "missing")
            .refine((value) => value === "" || (isNumber(value) && Number(value) > 0), "number")
            .refine((value) => !isNumber(value) || Number(value) <= POSTING.weightLb, "heavy"),
        pallets: z
            .string()
            .trim()
            .refine((value) => value === "" || /^\d+$/.test(value), "whole")
            .refine((value) => value === "" || Number(value) <= POSTING.pallets, "pallets"),
        tempMinF: z.string().trim(),
        tempMaxF: z.string().trim(),
        hazmat: z.boolean(),
        unNumber: z.string().trim(),
        requirements: z.array(z.enum(REQUIREMENTS)),
        poNumber: z.string().trim().max(POSTING.poNumber, "long"),
    })
    .superRefine((entries, ctx) => {
        const temp = entries.equipment === "reefer" ? tempIssue(entries.tempMinF, entries.tempMaxF) : null;
        if (temp) ctx.addIssue({ code: "custom", path: [isNumber(entries.tempMinF) ? "tempMaxF" : "tempMinF"], message: temp });
        if (entries.hazmat && !UN_NUMBER.test(entries.unNumber.toUpperCase())) ctx.addIssue({ code: "custom", path: ["unNumber"], message: "un" });
    });

export const postNoteSchema = z.string().trim().max(POSTING.note, "long");

const draftStopSchema = draftStopDtoSchema
    .extend({
        facilityId: z.string().min(1),
        windowStart: z.iso.datetime({ offset: true }),
        windowEnd: z.iso.datetime({ offset: true }),
        reference: z.string().trim().max(POSTING.reference).nullable(),
        instructions: z.string().trim().max(POSTING.instructions).nullable(),
    })
    .refine((stop) => ordered(stop.windowStart, stop.windowEnd), { path: ["windowEnd"] });

const draftStopsSchema = z
    .array(draftStopSchema)
    .min(POSTING.stops.min)
    .max(POSTING.stops.max)
    .refine((stops) => typesInOrder(stops.map((stop) => stop.type)) && windowsInOrder(stops));

const draftFreightSchema = draftFreightDtoSchema
    .extend({
        commodity: z.string().trim().min(1).max(POSTING.commodity),
        weightLb: z.number().positive().max(POSTING.weightLb),
        pallets: z.number().int().min(0).max(POSTING.pallets).nullable(),
        tempMinF: z.number().min(POSTING.tempF.min).max(POSTING.tempF.max).nullable(),
        tempMaxF: z.number().min(POSTING.tempF.min).max(POSTING.tempF.max).nullable(),
        unNumber: z.string().regex(UN_NUMBER).nullable(),
        poNumber: z.string().trim().max(POSTING.poNumber).nullable(),
    })
    .refine((freight) => freight.equipment !== "reefer" || (freight.tempMinF !== null && freight.tempMaxF !== null && freight.tempMinF <= freight.tempMaxF))
    .refine((freight) => freight.hazmat === (freight.unNumber !== null));

export const loadDraftRequestSchema = loadDraftRequestDtoSchema.extend({ stops: draftStopsSchema, freight: draftFreightSchema.nullable() });

export const loadDraftUpdateSchema = loadDraftUpdateDtoSchema.extend({
    version: z.number().int().positive(),
    stops: draftStopsSchema,
    freight: draftFreightSchema.nullable(),
});

export const quoteRequestSchema = loadQuoteRequestDtoSchema.extend({ version: z.number().int().positive() });

export const postLoadRequestSchema = postLoadRequestDtoSchema.extend({
    version: z.number().int().positive(),
    quoteId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    note: postNoteSchema.nullable(),
});

export const futureStops = (stops: readonly z.infer<typeof draftStopSchema>[]) => stops.every((stop) => future(stop.windowStart));

export const loadDraftEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: loadDraftDtoSchema });

export const loadQuoteEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: loadQuoteDtoSchema });

export const postLoadEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: postLoadResultDtoSchema });
