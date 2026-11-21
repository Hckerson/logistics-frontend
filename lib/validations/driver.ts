import { z } from "zod";
import {
    driverPodPageDtoSchema,
    driverPodPageTicketDtoSchema,
    driverPodSubmitDtoSchema,
    driverPositionDtoSchema,
    driverPositionsAcceptedDtoSchema,
    driverPositionsDtoSchema,
    driverStopEventDtoSchema,
    driverTripDtoSchema,
    driverTripsDtoSchema,
    driverUndoRequestDtoSchema,
} from "@/lib/contract/schemas";
import { POD_LIMITS, POSITION_REPORTING, STOP_EVENT_LIMITS } from "@/lib/driver/constants";
import { enveloped } from "@/lib/validations/freight";

const WHOLE_NUMBER = /^\d+$/;

export const stopEventSchema = driverStopEventDtoSchema.extend({
    seal: z.string().trim().min(1).max(STOP_EVENT_LIMITS.sealMax).optional(),
    pieces: z.number().int().min(0).max(STOP_EVENT_LIMITS.piecesMax).optional(),
});

export const departureSchema = z.object({
    seal: z.string().trim().min(1).max(STOP_EVENT_LIMITS.sealMax),
    pieces: z.string().trim().regex(WHOLE_NUMBER).transform(Number).pipe(z.number().int().min(0).max(STOP_EVENT_LIMITS.piecesMax)),
});

export const undoRequestSchema = driverUndoRequestDtoSchema;

export const undoPayloadSchema = driverUndoRequestDtoSchema.extend({ eventId: z.string() });

export const podPageSchema = driverPodPageDtoSchema;

export const podSubmitSchema = driverPodSubmitDtoSchema.extend({
    pageIds: z.array(z.string()).min(POD_LIMITS.minPages).max(POD_LIMITS.maxPages),
    receiverName: z.string().trim().min(1).max(POD_LIMITS.receiverMax),
    osdNotes: z.string().trim().max(POD_LIMITS.notesMax).optional(),
});

export const queueEntrySchema = z.object({
    id: z.string(),
    owner: z.string(),
    loadId: z.string(),
    kind: z.enum(["event", "undo", "podPage", "pod"]),
    createdAt: z.number(),
    failure: z.string().nullable(),
    event: driverStopEventDtoSchema.pick({ type: true, stopId: true, recordedAt: true }).nullable(),
    target: z.string().nullable(),
    page: driverPodPageDtoSchema.pick({ contentType: true, sizeBytes: true }).nullable(),
});

export const positionReportSchema = driverPositionsDtoSchema.extend({
    positions: z
        .array(
            driverPositionDtoSchema.extend({
                id: z.string().min(1).max(POSITION_REPORTING.idMax),
                recordedAt: z.iso.datetime(),
                latitude: z.number().min(-90).max(90),
                longitude: z.number().min(-180).max(180),
            }),
        )
        .min(1)
        .max(POSITION_REPORTING.batchMax),
});

export const positionsAcceptedEnvelopeSchema = enveloped(driverPositionsAcceptedDtoSchema);

export const driverTripsEnvelopeSchema = enveloped(driverTripsDtoSchema);
export const driverTripEnvelopeSchema = enveloped(driverTripDtoSchema);
export const podTicketEnvelopeSchema = enveloped(driverPodPageTicketDtoSchema);
