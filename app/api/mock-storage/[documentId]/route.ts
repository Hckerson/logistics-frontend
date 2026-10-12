import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";

type Context = RouteContext<"/api/mock-storage/[documentId]">;

const missing = () => new NextResponse(null, { status: HTTP_STATUS.notFound });

const storedDocument = async ({ params }: Context) => {
    if (!API_MOCKS) return null;
    const [{ documentId }, { freightStore }] = await Promise.all([params, import("@/lib/mocks/freight-store")]);
    const store = freightStore();
    const document = store.documents.get(documentId);
    return document ? { store, document } : null;
};

export async function PUT(request: Request, context: Context) {
    const found = await storedDocument(context);
    if (!found) return missing();
    found.store.blobs.set(found.document.id, new Uint8Array(await request.arrayBuffer()));
    return new NextResponse(null, { status: HTTP_STATUS.ok });
}

export async function GET(_request: Request, context: Context) {
    const found = await storedDocument(context);
    if (!found) return missing();

    const { MOCK_SAMPLE_PDF, MOCK_SAMPLE_TYPE } = await import("@/lib/data/mocks/freight");
    const uploaded = found.store.blobs.get(found.document.id);
    return new NextResponse(uploaded ?? new TextEncoder().encode(MOCK_SAMPLE_PDF), {
        headers: {
            "Content-Type": uploaded ? found.document.contentType : MOCK_SAMPLE_TYPE,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(found.document.fileName)}"`,
        },
    });
}
