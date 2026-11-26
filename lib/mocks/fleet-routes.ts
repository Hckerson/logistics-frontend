import { routes } from "@/lib/contract/routes";
import { pathOf } from "@/lib/mocks/match-route";
import { assignLoad, fleetOptions } from "@/lib/mocks/fleet-assign";
import { deactivateDriver, resendInvitation, revokeInvitation, roster } from "@/lib/mocks/fleet-drivers";
import { endUnavailable, recommendations, setUnavailable } from "@/lib/mocks/fleet-availability";
import { fleetPlan } from "@/lib/mocks/fleet-plan";
import { listVehicles, retireVehicle, saveVehicle } from "@/lib/mocks/fleet-vehicles";
import type { MockHandler } from "@/lib/types";

export const FLEET_HANDLERS: Record<string, MockHandler> = {
    [`GET ${pathOf(routes.fleetPlan())}`]: fleetPlan,
    [`GET ${pathOf(routes.fleetRecommendations())}`]: recommendations,
    [`POST ${routes.fleetSetUnavailable(":truckId")}`]: setUnavailable,
    [`POST ${routes.fleetEndUnavailable(":truckId", ":periodId")}`]: endUnavailable,
    [`GET ${routes.fleetOptionsFor(":loadId")}`]: fleetOptions,
    [`POST ${routes.fleetAssign(":loadId")}`]: assignLoad,
    [`GET ${pathOf(routes.fleetVehicles())}`]: listVehicles,
    [`POST ${routes.fleetAddVehicle()}`]: saveVehicle,
    [`POST ${routes.fleetUpdateVehicle(":vehicleId")}`]: saveVehicle,
    [`POST ${routes.fleetRetireVehicle(":vehicleId")}`]: retireVehicle,
    [`GET ${routes.fleetDrivers()}`]: roster,
    [`POST ${routes.fleetDeactivateDriver(":driverId")}`]: deactivateDriver,
    [`POST ${routes.teamResendInvitation(":invitationId")}`]: resendInvitation,
    [`POST ${routes.teamRevokeInvitation(":invitationId")}`]: revokeInvitation,
};
