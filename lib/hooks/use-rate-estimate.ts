import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { ESTIMATE_TIMING } from "@/lib/quotes/constants";
import { quoteKeys } from "@/lib/quotes/keys";
import type { LaneQuery } from "@/lib/types";
import { estimateEnvelopeSchema } from "@/lib/validations/lane";

export const useRateEstimate = (lane: LaneQuery | null) =>
    useQuery({
        queryKey: quoteKeys.estimate(lane),
        queryFn: lane
            ? async ({ signal }) => ({
                  lane,
                  estimate: estimateEnvelopeSchema.parse(
                      await local.get(apiRoutes.rateEstimate(lane), { signal, timeout: ESTIMATE_TIMING.timeoutMs }),
                  ).data,
              })
            : skipToken,
        staleTime: ESTIMATE_TIMING.staleMs,
        placeholderData: keepPreviousData,
        retry: false,
    });
