import { NextResponse } from "next/server";
import { backendPost, relay } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import { withSessionHandler } from "@/lib/utils/with-action";
import { ticketStatusQuerySchema } from "@/lib/validations/support";

export const GET = withSessionHandler(async (request, { user }) => {
    const status = ticketStatusQuerySchema.safeParse(request.nextUrl.searchParams.get("status") ?? undefined);
    if (!status.success) return NextResponse.json({ message: INVALID_REQUEST }, { status: HTTP_STATUS.badRequest });
    return relay(await backendPost(routes.supportListMine(), { email: user.email, status: status.data }));
});
