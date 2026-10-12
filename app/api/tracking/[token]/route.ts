import { backendFetch, relay } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { PUBLIC_TRACKING_HEADERS } from "@/lib/loads/constants";
import { withHandler } from "@/lib/utils/with-action";

export const GET = withHandler<RouteContext<"/api/tracking/[token]">>(async (_request, _context, route) => {
    const token = (await route?.params)?.token ?? "";
    const response = relay(await backendFetch(routes.publicTrackingFind(encodeURIComponent(token))));
    Object.entries(PUBLIC_TRACKING_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
    return response;
});
