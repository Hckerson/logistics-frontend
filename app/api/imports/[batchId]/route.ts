import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/imports/[batchId]">>(async (_request, route) => {
    const batchId = await paramOf(route, "batchId");
    return batchId && routes.importsFindOne(batchId);
});
