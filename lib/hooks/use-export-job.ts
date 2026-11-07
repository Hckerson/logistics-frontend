import { useMutation, useQuery } from "@tanstack/react-query";
import { requestExport } from "@/lib/actions/request-export";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { ExportJobDto, LoadExportRequestDto } from "@/lib/contract/schemas";
import { EXPORT_RULES } from "@/lib/loads/shipments";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { downloadLinkEnvelopeSchema, exportJobEnvelopeSchema } from "@/lib/validations/freight";

const settled = (status: ExportJobDto["status"]) => EXPORT_RULES.settled.some((state) => state === status);

const pollFor = (job: ExportJobDto | undefined) => {
    if (!job || settled(job.status)) return false;
    return job.rowCount > EXPORT_RULES.instantRows ? EXPORT_RULES.pollMs.job : EXPORT_RULES.pollMs.quick;
};

export const exportKeys = { job: (exportId: string) => ["exports", exportId] as const };

export const useRequestExport = () => useMutation({ mutationFn: async (input: LoadExportRequestDto) => unwrap(await requestExport(input)) });

export const useExportJob = (exportId: string | null) =>
    useQuery({
        queryKey: exportKeys.job(exportId ?? ""),
        queryFn: async ({ signal }) => exportJobEnvelopeSchema.parse(await local.get(apiRoutes.exportJob(exportId ?? ""), { signal })).data,
        enabled: exportId !== null,
        refetchInterval: ({ state }) => pollFor(state.data),
        ...READ_RETRY,
    });

export const useExportDownload = () =>
    useMutation({ mutationFn: async (exportId: string) => downloadLinkEnvelopeSchema.parse(await local.get(apiRoutes.exportDownload(exportId))).data });
