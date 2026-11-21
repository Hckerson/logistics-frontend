import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";
import { withHandler } from "@/lib/utils/with-action";

type Context = RouteContext<"/api/mock-storage/import-files/[name]">;

const CSV = "text/csv; charset=utf-8";

export const GET = withHandler<Context>(async (_request, _context, route) => {
    if (!API_MOCKS || !route) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    const [{ name }, { sampleFile, templateFile }, { MOCK_IMPORTS }] = await Promise.all([route.params, import("@/lib/mocks/import-files"), import("@/lib/data/mocks/imports")]);
    const file = name === MOCK_IMPORTS.templateFile ? templateFile() : sampleFile(name);
    if (!file) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    return new NextResponse(file.body, { headers: { "Content-Type": CSV, "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"` } });
});
