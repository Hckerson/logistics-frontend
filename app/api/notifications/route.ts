import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { pageQuerySchema } from "@/lib/validations/freight";

export const GET = relayRead((request) => {
    const search = validSearch(request, pageQuerySchema);
    return search === null ? null : `${routes.notificationsList()}${search}`;
});
