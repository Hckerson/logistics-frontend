import { useQuery } from "@tanstack/react-query";
import { listTickets } from "@/lib/actions/list-tickets";
import type { TicketStatus } from "@/lib/types";

export const ticketKeys = {
    all: ["tickets"] as const,
    mine: (status?: TicketStatus) => ["tickets", "mine", status ?? "all"] as const,
};

export const useTickets = (status: TicketStatus | undefined, enabled: boolean) =>
    useQuery({
        queryKey: ticketKeys.mine(status),
        queryFn: async () => {
            const result = await listTickets(status);
            if (!result.ok) throw new Error(result.message);
            return result.data;
        },
        enabled,
        refetchOnWindowFocus: true,
    });
