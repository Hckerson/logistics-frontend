import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { TIME_MS } from "@/lib/constants";
import { DOCUMENT_RULES } from "@/lib/loads/constants";
import type { PreviewSource } from "@/lib/types";
import { READ_RETRY } from "@/lib/utils/action-result";
import { documentPreviewEnvelopeSchema } from "@/lib/validations/documents";

const FRESH_MS = DOCUMENT_RULES.signedUrlSeconds * TIME_MS.second - TIME_MS.minute;

export const previewKeys = {
    one: (source: PreviewSource, documentId: string) => ["documents", "preview", source.kind === "trip" ? source.loadId : source.kind, documentId] as const,
};

const routeOf = (source: PreviewSource, documentId: string) =>
    source.kind === "trip" ? apiRoutes.driverDocumentPreview(source.loadId, documentId) : apiRoutes.documentPreview(documentId);

export const useDocumentPreview = (source: PreviewSource, documentId: string, enabled: boolean) =>
    useQuery({
        queryKey: previewKeys.one(source, documentId),
        queryFn: async ({ signal }) => documentPreviewEnvelopeSchema.parse(await local.get(routeOf(source, documentId), { signal })).data,
        enabled,
        staleTime: FRESH_MS,
        refetchInterval: enabled ? FRESH_MS : false,
        ...READ_RETRY,
    });
