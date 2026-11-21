import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";
import { withHandler } from "@/lib/utils/with-action";

type Context = RouteContext<"/api/mock-storage/remittance/[paymentId]">;

const CSV = "text/csv; charset=utf-8";

export const GET = withHandler<Context>(async (_request, _context, route) => {
    if (!API_MOCKS || !route) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    const [{ paymentId }, { remittanceFile }] = await Promise.all([route.params, import("@/lib/mocks/invoices")]);
    const file = remittanceFile(paymentId);
    if (!file) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    return new NextResponse(file.body, { headers: { "Content-Type": CSV, "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"` } });
});
