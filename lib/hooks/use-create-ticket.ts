import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "@/lib/actions/create-ticket";
import { ticketKeys } from "@/lib/hooks/use-tickets";
import type { TicketRequest } from "@/lib/types";

export const useCreateTicket = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (input: TicketRequest) => createTicket(input),
        onSuccess: () => client.invalidateQueries({ queryKey: ticketKeys.all }),
    });
};
