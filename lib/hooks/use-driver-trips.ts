import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import type { z } from "zod";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { driverTripDtoSchema, driverTripsDtoSchema, type DriverTripDto } from "@/lib/contract/schemas";
import type { CachedValue } from "@/lib/types";
import { failureFrom, READ_RETRY } from "@/lib/utils/action-result";
import { offlineQueue } from "@/lib/utils/offline-queue";
import { driverTripEnvelopeSchema, driverTripsEnvelopeSchema } from "@/lib/validations/driver";

export const tripKeys = {
    all: ["trips"] as const,
    driver: () => ["trips", "driver"] as const,
    detail: (loadId: string) => ["trips", "detail", loadId] as const,
};

const TRIPS_CACHE = "trips";
const tripCache = (loadId: string) => `trip:${loadId}`;

function useCached<T>(owner: string, key: string, schema: z.ZodType<T>) {
    const [cached, setCached] = useState<CachedValue<T> | null>(null);

    useEffect(() => {
        let current = true;
        offlineQueue
            .readCache(owner, key, schema)
            .then((value) => {
                if (current) setCached(value);
            })
            .catch(() => undefined);
        return () => {
            current = false;
        };
    }, [owner, key, schema]);

    return cached;
}

const withCache = <T>(query: UseQueryResult<T>, cached: CachedValue<T> | null) => ({
    data: query.data ?? cached?.data ?? null,
    savedAt: query.data ? query.dataUpdatedAt : (cached?.savedAt ?? null),
    stale: !query.data || query.isError,
    query,
});

export const useDriverTrips = (owner: string) => {
    const query = useQuery({
        queryKey: tripKeys.driver(),
        queryFn: async ({ signal }) => {
            const data = driverTripsEnvelopeSchema.parse(await local.get(apiRoutes.driverTrips(), { signal })).data;
            void offlineQueue.writeCache(owner, TRIPS_CACHE, data);
            return data;
        },
        refetchOnWindowFocus: true,
        ...READ_RETRY,
    });
    return withCache(query, useCached(owner, TRIPS_CACHE, driverTripsDtoSchema));
};

export const useTrip = (owner: string, loadId: string) => {
    const query = useQuery({
        queryKey: tripKeys.detail(loadId),
        queryFn: async ({ signal }) => {
            const data = driverTripEnvelopeSchema.parse(await local.get(apiRoutes.driverTrip(loadId), { signal })).data;
            void offlineQueue.writeCache(owner, tripCache(loadId), data);
            return data;
        },
        refetchOnWindowFocus: true,
        ...READ_RETRY,
    });
    const withdrawn = failureFrom(query.error)?.errorClass === "not-found";

    useEffect(() => {
        if (withdrawn) void offlineQueue.dropCache(owner, tripCache(loadId));
    }, [withdrawn, owner, loadId]);

    return { ...withCache(query, useCached(owner, tripCache(loadId), driverTripDtoSchema)), withdrawn };
};

export const useTripSaver = (owner: string) => {
    const client = useQueryClient();
    return useCallback(
        (trip: DriverTripDto) => {
            client.setQueryData(tripKeys.detail(trip.loadId), trip);
            void offlineQueue.writeCache(owner, tripCache(trip.loadId), trip);
            void client.invalidateQueries({ queryKey: tripKeys.driver() });
        },
        [client, owner],
    );
};
