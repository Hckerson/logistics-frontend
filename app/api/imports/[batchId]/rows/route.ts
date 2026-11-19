import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead, validSearch } from "@/lib/utils/relay-read";
import { importRowsQuerySchema } from "@/lib/validations/imports";

export const GET = relayRead<RouteContext<"/api/imports/[batchId]/rows">>(async (request, route) => {
    const batchId = await paramOf(route, "batchId");
    const search = validSearch(request, importRowsQuerySchema);
    return batchId && search !== null ? `${routes.importsRows(batchId)}${search}` : null;
});
