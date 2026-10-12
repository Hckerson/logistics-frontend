import { z } from "zod";
import {
    apiEnvelopeDtoSchema,
    checkCallResponseDtoSchema,
    documentDtoSchema,
    downloadLinkDtoSchema,
    loadCountDtoSchema,
    loadDtoSchema,
    loadEventPageDtoSchema,
    loadPageDtoSchema,
    loadPositionsDtoSchema,
    mapPositionDtoSchema,
    notificationPageDtoSchema,
    quickFindDtoSchema,
    trackingLinkDtoSchema,
    unreadCountDtoSchema,
    uploadRequestDtoSchema,
    uploadTicketDtoSchema,
} from "@/lib/contract/schemas";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_STATUSES } from "@/lib/enums/load-status";
import { DOCUMENT_RULES, LOAD_PAGE_SIZE, LOAD_SEARCH_MAX, QUERY_BASE, QUICK_FIND, TIMELINE_CATEGORIES } from "@/lib/loads/constants";
import { trackingSendReceiptSchema } from "@/lib/validations/tracking";

const enveloped = <T extends z.ZodType>(data: T) => apiEnvelopeDtoSchema.extend({ data });

const commaList = <T extends z.ZodType>(item: T) =>
    z
        .string()
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(z.array(item));

export const loadListQuerySchema = z.object({
    status: commaList(z.enum(LOAD_STATUSES)).optional(),
    equipment: commaList(z.enum(EQUIPMENT_TYPES)).optional(),
    q: z.string().trim().max(LOAD_SEARCH_MAX).optional(),
    late: z.enum(["true", "false"]).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(LOAD_PAGE_SIZE.max).optional(),
});

export const timelineQuerySchema = z.object({
    category: z.enum(TIMELINE_CATEGORIES).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(LOAD_PAGE_SIZE.max).optional(),
});

export const quickFindQuerySchema = z.object({ q: z.string().trim().min(QUICK_FIND.min).max(QUICK_FIND.max) });

export const documentFileSchema = uploadRequestDtoSchema.extend({
    fileName: z.string().trim().min(1).max(DOCUMENT_RULES.nameMax),
    sizeBytes: z.number().int().min(1).max(DOCUMENT_RULES.maxBytes),
});

export const pageQuerySchema = timelineQuerySchema.omit({ category: true });

export const queryOf = (path: string) => Object.fromEntries(new URL(path, QUERY_BASE).searchParams);

export const loadPageEnvelopeSchema = enveloped(loadPageDtoSchema);
export const loadEnvelopeSchema = enveloped(loadDtoSchema);
export const loadCountsEnvelopeSchema = enveloped(z.array(loadCountDtoSchema));
export const loadPositionsEnvelopeSchema = enveloped(loadPositionsDtoSchema);
export const mapPositionsEnvelopeSchema = enveloped(z.array(mapPositionDtoSchema));
export const checkCallEnvelopeSchema = enveloped(checkCallResponseDtoSchema);
export const loadEventsEnvelopeSchema = enveloped(loadEventPageDtoSchema);
export const trackingLinksEnvelopeSchema = enveloped(z.array(trackingLinkDtoSchema));
export const trackingLinkEnvelopeSchema = enveloped(trackingLinkDtoSchema);
export const trackingSendEnvelopeSchema = enveloped(trackingSendReceiptSchema);
export const documentsEnvelopeSchema = enveloped(z.array(documentDtoSchema));
export const documentEnvelopeSchema = enveloped(documentDtoSchema);
export const uploadTicketEnvelopeSchema = enveloped(uploadTicketDtoSchema);
export const downloadLinkEnvelopeSchema = enveloped(downloadLinkDtoSchema);
export const notificationPageEnvelopeSchema = enveloped(notificationPageDtoSchema);
export const unreadCountEnvelopeSchema = enveloped(unreadCountDtoSchema);
export const quickFindEnvelopeSchema = enveloped(quickFindDtoSchema);
