"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import type { ActionResult, TicketReceipt, TicketRequest } from "@/lib/types";
import { contractFailure, invalidInput } from "@/lib/utils/action-result";
import { withAction } from "@/lib/utils/with-action";
import { ticketReceiptSchema, ticketRequestSchema } from "@/lib/validations/support";

export const createTicket = withAction(async ({ user }, input: TicketRequest): Promise<ActionResult<TicketReceipt>> => {
    const parsed = ticketRequestSchema.safeParse({ ...input, email: user?.email ?? input.email });
    if (!parsed.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.supportTickets(), parsed.data);
    if (!upstream.ok) return actionFailure(upstream);

    const receipt = ticketReceiptSchema.safeParse(await readJson(upstream));
    return receipt.success ? { ok: true, data: receipt.data.data } : contractFailure();
});
