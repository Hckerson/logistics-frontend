import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeDocumentUpload } from "@/lib/actions/complete-document-upload";
import { requestDocumentUpload } from "@/lib/actions/request-document-upload";
import { local, storage } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { DocumentDto } from "@/lib/contract/schemas";
import { timelineKeys } from "@/lib/hooks/use-load-timeline";
import { DOCUMENT_SCAN_POLL_MS } from "@/lib/loads/constants";
import { ActionError, invalidInput, READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { documentFileSchema, documentsEnvelopeSchema, downloadLinkEnvelopeSchema } from "@/lib/validations/freight";

interface DocumentUpload {
    file: File;
    type: DocumentDto["type"];
}

export const documentKeys = {
    all: ["documents"] as const,
    list: (loadId: string) => ["documents", "load", loadId] as const,
};

const scanning = (documents: readonly DocumentDto[] | undefined) => documents?.some((document) => document.scanStatus === "pending") ?? false;

export const useDocuments = (loadId: string) =>
    useQuery({
        queryKey: documentKeys.list(loadId),
        queryFn: async ({ signal }) => documentsEnvelopeSchema.parse(await local.get(apiRoutes.loadDocuments(loadId), { signal })).data,
        refetchOnWindowFocus: true,
        refetchInterval: ({ state }) => (scanning(state.data) ? DOCUMENT_SCAN_POLL_MS : false),
        ...READ_RETRY,
    });

export const useDocumentDownload = () =>
    useMutation({
        mutationFn: async (documentId: string) => downloadLinkEnvelopeSchema.parse(await local.get(apiRoutes.documentDownload(documentId))).data,
    });

export const useDocumentUpload = (loadId: string) => {
    const client = useQueryClient();
    const [progress, setProgress] = useState(0);
    const mutation = useMutation({
        mutationFn: async ({ file, type }: DocumentUpload) => {
            const declared = documentFileSchema.safeParse({ type, fileName: file.name, contentType: file.type, sizeBytes: file.size });
            if (!declared.success) throw new ActionError(invalidInput());

            setProgress(0);
            const ticket = unwrap(await requestDocumentUpload(loadId, declared.data));
            await storage.put(ticket.uploadUrl, file, setProgress);
            return unwrap(await completeDocumentUpload(ticket.document.id));
        },
        onSettled: () => {
            void client.invalidateQueries({ queryKey: documentKeys.list(loadId) });
            void client.invalidateQueries({ queryKey: timelineKeys.load(loadId) });
        },
    });
    return { ...mutation, progress };
};
