import { routes } from "@/lib/contract/routes";
import { paramOf, relayRead } from "@/lib/utils/relay-read";

export const GET = relayRead<RouteContext<"/api/invoice-payments/[paymentId]/remittance">>(async (_request, route) => {
    const paymentId = await paramOf(route, "paymentId");
    return paymentId && routes.invoicesRemittance(paymentId);
});
