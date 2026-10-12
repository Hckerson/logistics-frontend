import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { loadListQuerySchema } from "@/lib/validations/freight";

export const GET = relayRead((request) => {
    const search = validSearch(request, loadListQuerySchema);
    return search === null ? null : `${routes.loadsFindAll()}${search}`;
});
