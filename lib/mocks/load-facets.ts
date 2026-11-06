import { HTTP_STATUS } from "@/lib/constants";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { sees, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { ok } from "@/lib/mocks/http";
import { deliveryOf, pickupOf } from "@/lib/mocks/load-query";

const places = (facilities: readonly string[]) => {
    const unique = new Map(facilities.map((key) => [`${MOCK_FACILITIES[key].city}|${MOCK_FACILITIES[key].region}`, MOCK_FACILITIES[key]]));
    return [...unique.values()].map(({ city, region }) => ({ city, region })).sort((first, second) => first.city.localeCompare(second.city));
};

export const loadFacets = withCaller((_request, _params, caller) => {
    const loads = [...freightStore().loads.values()].filter(sees(caller));
    const carriers = [...new Set(loads.flatMap((load) => (load.carrier ? [load.carrier] : [])))]
        .map((id) => ({ id, name: MOCK_ORGANISATIONS[id].name }))
        .sort((first, second) => first.name.localeCompare(second.name));

    return ok(HTTP_STATUS.ok, {
        carriers,
        origins: places(loads.map((load) => pickupOf(load).facility)),
        destinations: places(loads.map((load) => deliveryOf(load).facility)),
    });
});
