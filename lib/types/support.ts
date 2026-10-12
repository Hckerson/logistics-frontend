import type { z } from "zod";
import type { TICKET_STATUSES } from "@/lib/enums/ticket-status";
import type { TICKET_URGENCIES } from "@/lib/enums/ticket-urgency";
import type { TICKET_CATEGORIES } from "@/lib/support/constants";
import type {
    ticketContextSchema,
    ticketDraftSchema,
    ticketFormSchema,
    ticketRequestSchema,
    ticketSummarySchema,
} from "@/lib/validations/support";

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export type TicketUrgency = (typeof TICKET_URGENCIES)[number];

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type SupportContext = z.infer<typeof ticketContextSchema>;

export type TicketRequest = z.infer<typeof ticketRequestSchema>;

export type TicketSummary = z.infer<typeof ticketSummarySchema>;

export type TicketDraft = z.infer<typeof ticketDraftSchema>;

export type TicketField = keyof z.infer<typeof ticketFormSchema> | "email";

export type TicketDraftField = Exclude<keyof TicketDraft, "key" | "savedAt">;

export interface ContextLine {
    id: string;
    label: string;
    value: string;
}

export interface TicketReceipt {
    reference: string;
    urgency: TicketUrgency;
}

export interface ChoiceOption<T extends string> {
    value: T;
    label: string;
    detail?: string;
}
