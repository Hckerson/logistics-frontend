import { routes } from "@/lib/contract/routes";
import { pathOf } from "@/lib/mocks/match-route";
import { assignLoad, fleetOptions } from "@/lib/mocks/fleet-assign";
import { endUnavailable, recommendations, setUnavailable } from "@/lib/mocks/fleet-availability";
import { fleetPlan } from "@/lib/mocks/fleet-plan";
import type { MockHandler } from "@/lib/types";

export const FLEET_HANDLERS: Record<string, MockHandler> = {
    [`GET ${pathOf(routes.fleetPlan())}`]: fleetPlan,
    [`GET ${pathOf(routes.fleetRecommendations())}`]: recommendations,
    [`POST ${routes.fleetSetUnavailable(":truckId")}`]: setUnavailable,
    [`POST ${routes.fleetEndUnavailable(":truckId", ":periodId")}`]: endUnavailable,
    [`GET ${routes.fleetOptionsFor(":loadId")}`]: fleetOptions,
    [`POST ${routes.fleetAssign(":loadId")}`]: assignLoad,
};
