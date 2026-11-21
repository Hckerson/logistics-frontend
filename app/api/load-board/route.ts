import { routes } from "@/lib/contract/routes";
import { relayRead, validSearch } from "@/lib/utils/relay-read";
import { loadBoardQuerySchema } from "@/lib/validations/load-board";

export const GET = relayRead((request) => {
    const search = validSearch(request, loadBoardQuerySchema);
    return search === null ? null : `${routes.loadBoardSearch()}${search}`;
});
