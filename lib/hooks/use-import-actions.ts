import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeImportUpload } from "@/lib/actions/complete-import-upload";
import { confirmImportBatch } from "@/lib/actions/confirm-import-batch";
import { excludeImportRows } from "@/lib/actions/exclude-import-rows";
import { mapImportColumns } from "@/lib/actions/map-import-columns";
import { priceImportBatch } from "@/lib/actions/price-import-batch";
import { requestImportUpload } from "@/lib/actions/request-import-upload";
import { updateImportRow } from "@/lib/actions/update-import-row";
import { storage } from "@/lib/api-client";
import type { ImportBatchDto, ImportConfirmRequestDto, ImportExcludeRequestDto, ImportMappingRequestDto, ImportRowUpdateDto, ImportVersionDto } from "@/lib/contract/schemas";
import { importKeys } from "@/lib/hooks/use-bulk-import";
import { loadKeys } from "@/lib/hooks/use-loads";
import type { ActionResult } from "@/lib/types";
import { ActionError, invalidInput, unwrap } from "@/lib/utils/action-result";
import { importUploadSchema } from "@/lib/validations/imports";

interface RowChange {
    rowId: string;
    input: ImportRowUpdateDto;
}

const useRefresh = (batchId: string) => {
    const client = useQueryClient();
    return (batch?: ImportBatchDto) => {
        if (batch) client.setQueryData(importKeys.batch(batchId), batch);
        else void client.invalidateQueries({ queryKey: importKeys.batch(batchId) });
        void client.invalidateQueries({ queryKey: importKeys.rows(batchId) });
        void client.invalidateQueries({ queryKey: importKeys.list });
    };
};

const useBatchMutation = <I>(batchId: string, run: (input: I) => Promise<ActionResult<ImportBatchDto>>) => {
    const refresh = useRefresh(batchId);
    return useMutation({ mutationFn: async (input: I) => unwrap(await run(input)), onSuccess: (batch) => refresh(batch) });
};

export const useImportUpload = () => {
    const client = useQueryClient();
    const [progress, setProgress] = useState(0);
    const mutation = useMutation({
        mutationFn: async (file: File) => {
            const declared = importUploadSchema.safeParse({ fileName: file.name, contentType: file.type, sizeBytes: file.size });
            if (!declared.success) throw new ActionError(invalidInput());
            setProgress(0);
            const ticket = unwrap(await requestImportUpload(declared.data));
            await storage.put(ticket.uploadUrl, file, setProgress);
            return { created: ticket.batch.id, batch: unwrap(await completeImportUpload(ticket.batch.id)) };
        },
        onSuccess: ({ batch }) => {
            client.setQueryData(importKeys.batch(batch.id), batch);
            void client.invalidateQueries({ queryKey: importKeys.list });
        },
    });
    return { ...mutation, progress };
};

export const useMapImport = (batchId: string) => useBatchMutation(batchId, (input: ImportMappingRequestDto) => mapImportColumns(batchId, input));

export const useExcludeImportRows = (batchId: string) => useBatchMutation(batchId, (input: ImportExcludeRequestDto) => excludeImportRows(batchId, input));

export const usePriceImportBatch = (batchId: string) => useBatchMutation(batchId, (input: ImportVersionDto) => priceImportBatch(batchId, input));

export const useConfirmImportBatch = (batchId: string) => {
    const client = useQueryClient();
    const confirm = useBatchMutation(batchId, (input: ImportConfirmRequestDto) => confirmImportBatch(batchId, input));
    return { ...confirm, settle: () => void client.invalidateQueries({ queryKey: loadKeys.all }) };
};

export const useUpdateImportRow = (batchId: string) => {
    const refresh = useRefresh(batchId);
    return useMutation({
        mutationFn: async ({ rowId, input }: RowChange) => unwrap(await updateImportRow(batchId, rowId, input)),
        onSettled: () => refresh(),
    });
};
