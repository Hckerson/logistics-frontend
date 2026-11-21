import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/loads/drafts/[draftId]">>(async (_request, route) => {
    const draftId = await paramOf(route, "draftId");
    return draftId && routes.loadDraftsFindOne(draftId);
});
