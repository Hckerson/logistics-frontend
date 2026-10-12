import { NETWORK_HUBS } from "@/lib/home/trips";
import { fail, ok } from "@/lib/mocks/http";
import { PLACE_QUERY } from "@/lib/quotes/constants";
import type { MockHandler } from "@/lib/types";
import { placeQuerySchema } from "@/lib/validations/lane";

const INVALID = "Validation failed";

export const places: MockHandler = ({ path }) => {
    const query = placeQuerySchema.safeParse(new URL(path, "http://mock.local").searchParams.get("q") ?? "");
    if (!query.success) return fail(400, INVALID, path);
    const needle = query.data.toLowerCase();
    return ok(
        200,
        NETWORK_HUBS.filter((hub) => hub.name.toLowerCase().includes(needle) || hub.code.toLowerCase() === needle)
            .slice(0, PLACE_QUERY.limit)
            .map(({ code, name }) => ({ code, name })),
    );
};
