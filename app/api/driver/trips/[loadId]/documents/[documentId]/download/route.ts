import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/driver/trips/[loadId]/documents/[documentId]/download">>(async (_request, route) => {
    const loadId = await paramOf(route, "loadId");
    const documentId = await paramOf(route, "documentId");
    return loadId && documentId && routes.driversDownloadDocument(loadId, documentId);
});
