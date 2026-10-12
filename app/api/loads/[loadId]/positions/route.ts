import { NextResponse } from "next/server";
import { backendFetch, relay } from "@/lib/api-server";
import { HTTP_STATUS, REQUEST_FAILED } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { POSITION_STREAM } from "@/lib/loads/constants";
import { positionStream, readPositions } from "@/lib/loads/position-stream";
import { invalidRequest, paramOf } from "@/lib/utils/relay-read";
import { withSessionHandler } from "@/lib/utils/with-action";

export const GET = withSessionHandler<RouteContext<"/api/loads/[loadId]/positions">>(async (request, _context, route) => {
    const loadId = await paramOf(route, "loadId");
    if (!loadId) return invalidRequest();
    if (!request.headers.get("accept")?.includes(POSITION_STREAM.contentType)) return relay(await backendFetch(routes.positionsForLoad(loadId)));

    const { upstream, payload } = await readPositions(loadId);
    if (!upstream.ok) return relay(upstream);
    if (payload === null) return NextResponse.json({ message: REQUEST_FAILED }, { status: HTTP_STATUS.badGateway });

    return new Response(positionStream(loadId, payload, request.signal), {
        headers: { "Content-Type": POSITION_STREAM.contentType, ...POSITION_STREAM.headers },
    });
});
