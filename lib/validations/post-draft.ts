import { z } from "zod";
import { loadQuoteDtoSchema } from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { POST_STEPS, REQUIREMENTS } from "@/lib/loads/posting";

const storedStopSchema = z.object({
    key: z.string(),
    type: z.enum(["pickup", "delivery"]),
    facilityId: z.string().nullable(),
    window: z.object({ start: z.string(), end: z.string() }).nullable(),
    reference: z.string(),
    instructions: z.string(),
});

const storedFreightSchema = z.object({
    equipment: z.enum(EQUIPMENT_TYPES).nullable(),
    commodity: z.string(),
    weightLb: z.string(),
    pallets: z.string(),
    tempMinF: z.string(),
    tempMaxF: z.string(),
    hazmat: z.boolean(),
    unNumber: z.string(),
    requirements: z.array(z.enum(REQUIREMENTS)),
    poNumber: z.string(),
});

export const storedDraftSchema = z.object({
    draftId: z.string().nullable(),
    version: z.number(),
    lane: z.object({ stops: z.array(storedStopSchema) }),
    freight: storedFreightSchema,
    quote: loadQuoteDtoSchema.nullable(),
    reached: z.enum(POST_STEPS),
    savedAt: z.number(),
});
