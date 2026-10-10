import { customAlphabet } from "nanoid";
import { scenario } from "@/lib/mocks/auth";
import { fail, ok } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { TICKET_REFERENCE_PREFIX } from "@/lib/support/constants";
import type { MockHandler, MockTicket } from "@/lib/types";
import { ticketListRequestSchema, ticketRequestSchema } from "@/lib/validations/support";

const INVALID_BODY = "Validation failed";
const referenceCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const summaryOf = ({ reference, subject, category, status, updated }: MockTicket) => ({ reference, subject, category, status, updated });

export const createTicket: MockHandler = ({ body, path }) => {
    const input = ticketRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const { tickets } = mockStore();
    const { key, email, subject, category, urgency } = input.data;
    const ticket: MockTicket = [...tickets.values()].find((candidate) => candidate.key === key) ?? {
        reference: `${TICKET_REFERENCE_PREFIX}${referenceCode()}`,
        key,
        owner: email.toLowerCase(),
        subject,
        category,
        urgency,
        status: "open",
        updated: new Date().toISOString(),
    };
    tickets.set(ticket.reference, ticket);
    return ok(201, { reference: ticket.reference, urgency: ticket.urgency });
};

export const listTickets: MockHandler = ({ body, path }) => {
    const input = ticketListRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const { email, status } = input.data;
    const mine = [...mockStore().tickets.values()]
        .filter((ticket) => ticket.owner === email.toLowerCase() && (!status || ticket.status === status))
        .sort((first, second) => second.updated.localeCompare(first.updated))
        .map(summaryOf);
    return ok(200, mine);
};
