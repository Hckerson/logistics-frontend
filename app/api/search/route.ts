import { routes } from "@/lib/contract/routes";
import { relayRead } from "@/lib/utils/relay-read";
import { quickFindQuerySchema } from "@/lib/validations/freight";

export const GET = relayRead((request) => {
    const query = quickFindQuerySchema.safeParse({ q: request.nextUrl.searchParams.get("q") ?? "" });
    return query.success ? routes.searchFind(query.data) : null;
});
