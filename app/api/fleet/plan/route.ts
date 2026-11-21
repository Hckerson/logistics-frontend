import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { fleetQuerySchema } from "@/lib/validations/fleet";

export const GET = relayRead((request) => {
    const search = validSearch(request, fleetQuerySchema);
    return search === null ? null : `${routes.fleetPlan()}${search}`;
});
