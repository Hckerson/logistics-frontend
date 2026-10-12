import { z } from "zod";
import { apiEnvelopeDtoSchema } from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES, PLACE_QUERY } from "@/lib/quotes/constants";
import { todayValue } from "@/lib/utils/date-formatter";

const place = z.string().trim().min(1, "missing").max(PLACE_QUERY.max, "long");

export const laneQuerySchema = z
    .object({
        origin: place,
        destination: place,
        equipment: z.enum(EQUIPMENT_TYPES, "missing"),
        date: z.iso.date("missing").refine((date) => date >= todayValue(), "past"),
    })
    .refine(({ origin, destination }) => origin.toLowerCase() !== destination.toLowerCase(), {
        path: ["destination"],
        message: "same",
    });

export const placeQuerySchema = z.string().trim().min(PLACE_QUERY.min).max(PLACE_QUERY.max);

export const placeSchema = z.object({ code: z.string(), name: z.string() });

export const rateEstimateSchema = z.object({
    origin: placeSchema,
    destination: placeSchema,
    miles: z.number(),
    rate: z.number(),
    low: z.number(),
    high: z.number(),
    perMile: z.number(),
    confidence: z.enum(["high", "medium", "low"]),
    samples: z.number(),
});

export const trendPointSchema = z.object({ date: z.string(), perMile: z.number(), samples: z.number() });

export const saveEstimateSchema = z.object({ email: z.email(), lane: laneQuerySchema, rate: z.number() });

export const placesEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: z.array(placeSchema) });

export const estimateEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: rateEstimateSchema });

export const trendEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: z.array(trendPointSchema) });

export const savedEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: z.object({ id: z.string() }) });
