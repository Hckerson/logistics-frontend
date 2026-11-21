import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";
import { withHandler } from "@/lib/utils/with-action";

type Context = RouteContext<"/api/mock-storage/imports/[batchId]">;

const CSV = "text/csv; charset=utf-8";
const missing = () => new NextResponse(null, { status: HTTP_STATUS.notFound });

export const PUT = withHandler<Context>(async (request, _context, route) => {
    if (!API_MOCKS || !route) return missing();
    const [{ batchId }, { importBatches, importBlobs }] = await Promise.all([route.params, import("@/lib/mocks/import-store")]);
    if (!importBatches().has(batchId)) return missing();
    importBlobs().set(batchId, new Uint8Array(await request.arrayBuffer()));
    return new NextResponse(null, { status: HTTP_STATUS.ok });
});

export const GET = withHandler<Context>(async (_request, _context, route) => {
    if (!API_MOCKS || !route) return missing();
    const [{ batchId }, { resultsFile }] = await Promise.all([route.params, import("@/lib/mocks/import-files")]);
    const file = resultsFile(batchId);
    if (!file) return missing();
    return new NextResponse(file.body, { headers: { "Content-Type": CSV, "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"` } });
});
