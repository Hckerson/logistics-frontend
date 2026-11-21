import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { recommendationQuerySchema } from "@/lib/validations/fleet";

export const GET = relayRead((request) => {
    const search = validSearch(request, recommendationQuerySchema);
    return search === null ? null : `${routes.fleetRecommendations()}${search}`;
});
