import { z } from "zod";
import { apiEnvelopeDtoSchema } from "@/lib/contract/schemas";
import { TICKET_CATEGORIES, TICKET_LIMITS, TICKET_STATUSES, TICKET_URGENCIES } from "@/lib/support/constants";

export const ticketContextSchema = z.object({
    topic: z.enum(TICKET_CATEGORIES).optional(),
    reference: z.string().trim().max(64).optional(),
    q: z.string().trim().max(200).optional(),
    article: z.string().trim().max(120).optional(),
});

const { shape } = ticketContextSchema;

export const ticketContextUrlSchema = z.object({
    topic: shape.topic.catch(undefined),
    reference: shape.reference.catch(undefined),
    q: shape.q.catch(undefined),
    article: shape.article.catch(undefined),
});

export const ticketFormSchema = z.object({
    category: z.enum(TICKET_CATEGORIES, "missing"),
    urgency: z.enum(TICKET_URGENCIES, "missing"),
    subject: z.string().trim().min(1, "missing").max(TICKET_LIMITS.subject, "long"),
    description: z.string().trim().min(1, "missing").max(TICKET_LIMITS.description, "long"),
    load: z.string().trim().max(TICKET_LIMITS.load, "long"),
});

export const ticketDraftSchema = z.object({
    key: z.string().min(1),
    savedAt: z.string(),
    category: z.enum(TICKET_CATEGORIES).nullable(),
    urgency: z.enum(TICKET_URGENCIES).nullable(),
    subject: z.string(),
    description: z.string(),
    load: z.string(),
    email: z.string(),
});

export const ticketContactSchema = z.object({
    email: z.string().trim().min(1, "missing").email("invalid"),
});

export const ticketRequestSchema = ticketFormSchema.extend({
    key: z.string().min(1),
    email: z.string().email(),
    context: ticketContextSchema,
});

export const ticketReceiptSchema = apiEnvelopeDtoSchema.extend({
    data: z.object({ reference: z.string().min(1), urgency: z.enum(TICKET_URGENCIES) }),
});

export const ticketSummarySchema = z.object({
    reference: z.string().min(1),
    subject: z.string(),
    category: z.enum(TICKET_CATEGORIES),
    status: z.enum(TICKET_STATUSES),
    updated: z.string(),
});

export const ticketListRequestSchema = z.object({
    email: z.string().email(),
    status: z.enum(TICKET_STATUSES).optional(),
});

export const ticketListSchema = apiEnvelopeDtoSchema.extend({ data: z.array(ticketSummarySchema) });
