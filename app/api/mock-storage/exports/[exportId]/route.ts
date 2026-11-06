import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";

type Context = RouteContext<"/api/mock-storage/exports/[exportId]">;

const CSV = "text/csv; charset=utf-8";

export async function GET(_request: Request, { params }: Context) {
    if (!API_MOCKS) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    const [{ exportId }, { exportFile }] = await Promise.all([params, import("@/lib/mocks/load-exports")]);
    const file = exportFile(exportId);
    if (!file) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    return new NextResponse(file.body, {
        headers: { "Content-Type": CSV, "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"` },
    });
}
