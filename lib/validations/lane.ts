import { z } from "zod";
import { apiEnvelopeDtoSchema, placeDtoSchema, rateEstimateDtoSchema, savedEstimateDtoSchema, trendPointDtoSchema } from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { PLACE_QUERY } from "@/lib/quotes/constants";
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

export const saveEstimateSchema = z.object({ email: z.email(), lane: laneQuerySchema, rate: z.number() });

export const placesEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: z.array(placeDtoSchema) });

export const estimateEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: rateEstimateDtoSchema });

export const trendEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: z.array(trendPointDtoSchema) });

export const savedEnvelopeSchema = apiEnvelopeDtoSchema.extend({ data: savedEstimateDtoSchema });
