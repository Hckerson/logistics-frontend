import { z } from "zod";
import {
    bookLoadDtoSchema,
    loadBookedDtoSchema,
    loadBoardPageDtoSchema,
    loadBookingDtoSchema,
} from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { enveloped } from "@/lib/validations/freight";

const { radius } = LOAD_BOARD;
const whole = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
const amount = z.coerce.number().min(0);
const place = z.string().trim().min(2).max(120);
const day = z.string().refine((value) => !Number.isNaN(Date.parse(value)));
const equipmentList = z.string().refine((value) => value.split(",").every((kind) => EQUIPMENT_TYPES.some((known) => known === kind)));

export const loadBoardQuerySchema = z
    .object({
        origin: place.optional(),
        originRadius: whole(radius.min, radius.max).optional(),
        destination: place.optional(),
        destinationRadius: whole(radius.min, radius.max).optional(),
        from: day.optional(),
        to: day.optional(),
        equipment: equipmentList.optional(),
        minRate: amount.optional(),
        minRpm: amount.optional(),
        maxWeight: amount.optional(),
        cursor: z.string().optional(),
        limit: whole(1, LOAD_BOARD.pageMax).optional(),
    })
    .refine(({ from, to }) => !from || !to || Date.parse(to) >= Date.parse(from), { path: ["to"] });

export const signerMatches = (typed: string, name: string) => typed.trim().replace(/\s+/g, " ").toLowerCase() === name.trim().replace(/\s+/g, " ").toLowerCase();

export const bookSchema = bookLoadDtoSchema.extend({
    signerName: z.string().trim().min(1).max(LOAD_BOARD.signerMax),
    attested: z.literal(true),
});

export const loadBoardEnvelopeSchema = enveloped(loadBoardPageDtoSchema);
export const loadBookingEnvelopeSchema = enveloped(loadBookingDtoSchema);
export const loadBookedEnvelopeSchema = enveloped(loadBookedDtoSchema);
