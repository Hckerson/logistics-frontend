import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { vehicleQuerySchema } from "@/lib/validations/fleet";

export const GET = relayRead((request) => {
    const search = validSearch(request, vehicleQuerySchema);
    return search === null ? null : `${routes.fleetVehicles()}${search}`;
});
