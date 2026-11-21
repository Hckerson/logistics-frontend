import "server-only";
import { publicFetch, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { NETWORK_STATS } from "@/lib/home/constants";
import { networkStatsEnvelopeSchema } from "@/lib/validations/stats";

export const readNetworkStats = async () => {
    const response = await publicFetch(routes.statsNetwork(), NETWORK_STATS.revalidateSeconds).catch(() => null);
    if (!response?.ok) return null;
    const parsed = networkStatsEnvelopeSchema.safeParse(await readJson(response));
    return parsed.success ? parsed.data.data : null;
};
