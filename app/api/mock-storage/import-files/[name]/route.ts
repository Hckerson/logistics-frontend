import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";

type Context = RouteContext<"/api/mock-storage/import-files/[name]">;

const CSV = "text/csv; charset=utf-8";

export async function GET(_request: Request, { params }: Context) {
    if (!API_MOCKS) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    const [{ name }, { sampleFile, templateFile }, { MOCK_IMPORTS }] = await Promise.all([params, import("@/lib/mocks/import-files"), import("@/lib/data/mocks/imports")]);
    const file = name === MOCK_IMPORTS.templateFile ? templateFile() : sampleFile(name);
    if (!file) return new NextResponse(null, { status: HTTP_STATUS.notFound });
    return new NextResponse(file.body, { headers: { "Content-Type": CSV, "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"` } });
}
