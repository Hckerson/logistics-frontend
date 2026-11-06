import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/exports/[exportId]">>(async (_request, route) => {
    const exportId = await paramOf(route, "exportId");
    return exportId && routes.exportsFindOne(exportId);
});
