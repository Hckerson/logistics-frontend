import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/invoices/[invoiceId]">>(async (_request, route) => {
    const invoiceId = await paramOf(route, "invoiceId");
    return invoiceId && routes.invoicesFindOne(invoiceId);
});
