import type { FleetQuery } from "@/lib/types";
import { fleetQuerySchema } from "@/lib/validations/fleet";

type Search = Record<string, string | string[] | undefined>;

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export const parsePlanSearch = (search: Search): FleetQuery => {
    const parsed = fleetQuerySchema.safeParse({
        week: single(search.week),
        truck: single(search.truck),
        driver: single(search.driver),
        equipment: single(search.equipment),
        carrier: single(search.carrier),
    });
    return parsed.success ? parsed.data : {};
};
