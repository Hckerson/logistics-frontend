import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, relay } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import { withHandler } from "@/lib/utils/with-action";
import { placeQuerySchema } from "@/lib/validations/lane";

export const GET = withHandler(async (request: NextRequest) => {
    const query = placeQuerySchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
    if (!query.success) return NextResponse.json({ message: INVALID_REQUEST }, { status: HTTP_STATUS.badRequest });
    return relay(await backendFetch(routes.geoPlaces({ q: query.data })));
});
