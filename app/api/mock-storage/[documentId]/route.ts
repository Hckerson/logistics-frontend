import { NextResponse } from "next/server";
import { API_MOCKS, HTTP_STATUS } from "@/lib/constants";
import { withHandler } from "@/lib/utils/with-action";

type Context = RouteContext<"/api/mock-storage/[documentId]">;

const missing = () => new NextResponse(null, { status: HTTP_STATUS.notFound });

const storedDocument = async (route: Context | undefined) => {
    if (!API_MOCKS || !route) return null;
    const [{ documentId }, { freightStore }] = await Promise.all([route.params, import("@/lib/mocks/freight-store")]);
    const store = freightStore();
    const document = store.documents.get(documentId);
    return document ? { store, document } : null;
};

export const PUT = withHandler<Context>(async (request, _context, route) => {
    const found = await storedDocument(route);
    if (!found) return missing();
    found.store.blobs.set(found.document.id, new Uint8Array(await request.arrayBuffer()));
    return new NextResponse(null, { status: HTTP_STATUS.ok });
});

const INLINE = "inline";

export const GET = withHandler<Context>(async (request, _context, route) => {
    const found = await storedDocument(route);
    if (!found) return missing();

    const [{ MOCK_SAMPLE_PDF, MOCK_SAMPLE_TYPE }, { MOCK_SAMPLE_IMAGE }] = await Promise.all([import("@/lib/data/mocks/freight"), import("@/lib/data/mocks/sample-image")]);
    const uploaded = found.store.blobs.get(found.document.id);
    const image = found.document.contentType !== MOCK_SAMPLE_TYPE;
    const sample = image ? Uint8Array.from(atob(MOCK_SAMPLE_IMAGE.base64), (char) => char.charCodeAt(0)) : new TextEncoder().encode(MOCK_SAMPLE_PDF);
    const disposition = new URL(request.url).searchParams.has(INLINE) ? "inline" : "attachment";
    return new NextResponse(uploaded ?? sample, {
        headers: {
            "Content-Type": uploaded ? found.document.contentType : image ? MOCK_SAMPLE_IMAGE.type : MOCK_SAMPLE_TYPE,
            "Content-Disposition": `${disposition}; filename="${encodeURIComponent(found.document.fileName)}"`,
        },
    });
});
