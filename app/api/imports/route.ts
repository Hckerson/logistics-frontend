import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { importPageQuerySchema } from "@/lib/validations/imports";

export const GET = relayRead((request) => {
    const search = validSearch(request, importPageQuerySchema);
    return search === null ? null : `${routes.importsFindAll()}${search}`;
});
