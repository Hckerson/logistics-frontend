"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, REQUEST_FAILED, SESSION_REQUIRED } from "@/lib/constants";
import type { ActionResult, TicketStatus, TicketSummary } from "@/lib/types";
import { getSession } from "@/lib/utils/session";
import { ticketListSchema } from "@/lib/validations/support";

export const listTickets = async (status?: TicketStatus): Promise<ActionResult<TicketSummary[]>> => {
    const session = await getSession();
    if (!session) return { ok: false, status: HTTP_STATUS.unauthorized, message: SESSION_REQUIRED };

    const upstream = await backendPost(unpublishedRoutes.supportTicketsMine(), { email: session.email, status });
    if (!upstream.ok) return actionFailure(upstream);

    const list = ticketListSchema.safeParse(await readJson(upstream));
    return list.success
        ? { ok: true, data: list.data.data }
        : { ok: false, status: HTTP_STATUS.badGateway, message: REQUEST_FAILED };
};
