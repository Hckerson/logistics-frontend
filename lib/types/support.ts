import type { z } from "zod";
import type { TicketReceiptDto, TicketSummaryDto } from "@/lib/contract/schemas";
import type { TICKET_STATUSES } from "@/lib/enums/ticket-status";
import type { TICKET_URGENCIES } from "@/lib/enums/ticket-urgency";
import type { TICKET_CATEGORIES } from "@/lib/support/constants";
import type {
    ticketContextSchema,
    ticketDraftSchema,
    ticketFormSchema,
    ticketRequestSchema,
} from "@/lib/validations/support";

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export type TicketUrgency = (typeof TICKET_URGENCIES)[number];

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type SupportContext = z.infer<typeof ticketContextSchema>;

export type TicketRequest = z.infer<typeof ticketRequestSchema>;

export type TicketSummary = TicketSummaryDto;

export type TicketDraft = z.infer<typeof ticketDraftSchema>;

export type TicketField = keyof z.infer<typeof ticketFormSchema> | "email";

export type TicketDraftField = Exclude<keyof TicketDraft, "key" | "savedAt">;

export interface ContextLine {
    id: string;
    label: string;
    value: string;
}

export type TicketReceipt = TicketReceiptDto;
