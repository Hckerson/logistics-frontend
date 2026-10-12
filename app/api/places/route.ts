import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, relay } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import { placeQuerySchema } from "@/lib/validations/lane";

export const GET = async (request: NextRequest) => {
    const query = placeQuerySchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
    if (!query.success) return NextResponse.json({ message: INVALID_REQUEST }, { status: HTTP_STATUS.badRequest });
    return relay(await backendFetch(unpublishedRoutes.places(query.data)));
};
