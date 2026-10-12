import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { TicketStatus } from "@/lib/types";
import { ticketListSchema } from "@/lib/validations/support";

export const ticketKeys = {
    all: ["tickets"] as const,
    mine: (status?: TicketStatus) => ["tickets", "mine", status ?? "all"] as const,
};

export const useTickets = (status: TicketStatus | undefined, enabled: boolean) =>
    useQuery({
        queryKey: ticketKeys.mine(status),
        queryFn: async ({ signal }) => ticketListSchema.parse(await local.get(apiRoutes.tickets(status), { signal })).data,
        enabled,
        refetchOnWindowFocus: true,
    });
