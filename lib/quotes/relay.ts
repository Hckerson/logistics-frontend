import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, relay } from "@/lib/api-server";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import type { LaneQuery } from "@/lib/types";
import { withHandler } from "@/lib/utils/with-action";
import { laneQuerySchema } from "@/lib/validations/lane";

export const laneRelay = (endpoint: (lane: LaneQuery) => string) =>
    withHandler(async (request: NextRequest) => {
        const lane = laneQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
        if (!lane.success) return NextResponse.json({ message: INVALID_REQUEST }, { status: HTTP_STATUS.badRequest });
        return relay(await backendFetch(endpoint(lane.data)));
    });
