import { format, subDays } from "date-fns";
import { DATE_VALUE_FORMAT, HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_NETWORK_STATS } from "@/lib/data/mocks/stats";
import { ok } from "@/lib/mocks/http";
import type { MockHandler } from "@/lib/types";

export const networkStats: MockHandler = () => {
    const now = new Date().getTime();
    const computedAt = new Date(now - (now % TIME_MS.hour));
    const { approvedCarriers, loadsDelivered, onTimeRate, periodDays } = MOCK_NETWORK_STATS;
    return ok(HTTP_STATUS.ok, {
        approvedCarriers,
        loadsDelivered,
        onTimeRate,
        periodStart: format(subDays(computedAt, periodDays), DATE_VALUE_FORMAT),
        periodEnd: format(computedAt, DATE_VALUE_FORMAT),
        computedAt: computedAt.toISOString(),
    });
};
