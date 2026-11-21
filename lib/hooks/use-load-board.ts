import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookLoad } from "@/lib/actions/book-load";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { BookLoadDto, LoadBookingDto } from "@/lib/contract/schemas";
import { fleetPlanKeys } from "@/lib/hooks/use-fleet-plan";
import { loadKeys } from "@/lib/hooks/use-loads";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import type { LoadBoardQuery } from "@/lib/types";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { loadBoardEnvelopeSchema, loadBookingEnvelopeSchema } from "@/lib/validations/load-board";

export const loadBoardKeys = {
    all: ["load-board"] as const,
    search: (query: LoadBoardQuery) => ["load-board", "search", query] as const,
    booking: (loadId: string) => ["load-board", "booking", loadId] as const,
};

export const useLoadBoard = (query: LoadBoardQuery, enabled = true) =>
    useQuery({
        queryKey: loadBoardKeys.search(query),
        queryFn: async ({ signal }) => loadBoardEnvelopeSchema.parse(await local.get(apiRoutes.loadBoard(query), { signal })).data,
        placeholderData: keepPreviousData,
        refetchInterval: LOAD_BOARD.refreshMs,
        staleTime: LOAD_BOARD.refreshMs,
        enabled,
        ...READ_RETRY,
    });

export const useLoadBooking = (loadId: string, initial: LoadBookingDto) =>
    useQuery({
        queryKey: loadBoardKeys.booking(loadId),
        queryFn: async ({ signal }) => loadBookingEnvelopeSchema.parse(await local.get(apiRoutes.loadBooking(loadId), { signal })).data,
        initialData: initial,
        staleTime: Infinity,
        ...READ_RETRY,
    });

export const useBookLoad = (loadId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: BookLoadDto) => unwrap(await bookLoad(loadId, input)),
        onSettled: () => {
            void client.invalidateQueries({ queryKey: loadBoardKeys.all });
            void client.invalidateQueries({ queryKey: loadKeys.all });
            void client.invalidateQueries({ queryKey: fleetPlanKeys.all });
        },
    });
};
