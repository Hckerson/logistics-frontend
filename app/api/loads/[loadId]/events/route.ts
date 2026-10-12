import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead, validSearch } from "@/lib/utils/relay-read";
import { timelineQuerySchema } from "@/lib/validations/freight";

export const GET = relayRead<RouteContext<"/api/loads/[loadId]/events">>(async (request, route) => {
    const loadId = await paramOf(route, "loadId");
    const search = validSearch(request, timelineQuerySchema);
    return loadId && search !== null ? `${routes.timelineList(loadId)}${search}` : null;
});
