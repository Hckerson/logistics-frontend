"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED } from "@/lib/constants";
import type { ActionResult, TicketReceipt, TicketRequest } from "@/lib/types";
import { getSession } from "@/lib/utils/session";
import { ticketReceiptSchema, ticketRequestSchema } from "@/lib/validations/support";

export const createTicket = async (input: TicketRequest): Promise<ActionResult<TicketReceipt>> => {
    const session = await getSession();
    const parsed = ticketRequestSchema.safeParse({ ...input, email: session?.email ?? input.email });
    if (!parsed.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const upstream = await backendPost(unpublishedRoutes.supportTickets(), parsed.data);
    if (!upstream.ok) return actionFailure(upstream);

    const receipt = ticketReceiptSchema.safeParse(await readJson(upstream));
    return receipt.success
        ? { ok: true, data: receipt.data.data }
        : { ok: false, status: HTTP_STATUS.badGateway, message: REQUEST_FAILED };
};
