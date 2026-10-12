import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/documents/[documentId]/download">>(async (_request, route) => {
    const documentId = await paramOf(route, "documentId");
    return documentId && routes.documentsDownload(documentId);
});
