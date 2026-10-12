import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/loads/[loadId]">>(async (_request, route) => {
    const loadId = await paramOf(route, "loadId");
    return loadId && routes.loadsFindOne(loadId);
});
