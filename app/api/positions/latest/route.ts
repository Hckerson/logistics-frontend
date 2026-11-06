import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { positionsQuerySchema } from "@/lib/validations/freight";

export const GET = relayRead((request) => {
    const search = validSearch(request, positionsQuerySchema);
    return search === null ? null : `${routes.positionsLatest()}${search}`;
});
