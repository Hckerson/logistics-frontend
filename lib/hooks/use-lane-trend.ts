import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { ESTIMATE_TIMING } from "@/lib/quotes/constants";
import { quoteKeys } from "@/lib/quotes/keys";
import type { LaneQuery } from "@/lib/types";
import { trendEnvelopeSchema } from "@/lib/validations/lane";

export const useLaneTrend = (lane: LaneQuery | null) =>
    useQuery({
        queryKey: quoteKeys.trend(lane),
        queryFn: lane
            ? async ({ signal }) =>
                  trendEnvelopeSchema.parse(
                      await local.get(apiRoutes.laneTrend(lane), { signal, timeout: ESTIMATE_TIMING.timeoutMs }),
                  ).data
            : skipToken,
        staleTime: ESTIMATE_TIMING.trendStaleMs,
        placeholderData: keepPreviousData,
        retry: false,
    });
