"use client";
import { useEffect, useRef, useState } from "react";
import { Download } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import ProgressLine from "@/components/ui/progress-line";
import type { LoadExportRequestDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { useExportDownload, useExportJob, useRequestExport } from "@/lib/hooks/use-export-job";
import { EXPORT_RULES } from "@/lib/loads/shipments";
import { UI_COPY } from "@/lib/ui/copy";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { fileSize, grouped } from "@/lib/utils/format-number";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    request: LoadExportRequestDto | null;
    count: number;
    initialJob: string | null;
}

const { exporting: copy } = SHIPMENTS_COPY;
const PERCENT = 100;

export default function ShipmentsExportDialog({ isOpen, onOpenChange, request, count, initialJob }: Props) {
    const [jobId, setJobId] = useState(initialJob);
    const start = useRequestExport();
    const job = useExportJob(jobId);
    const download = useExportDownload();
    const fetched = useRef<string | null>(null);
    const data = job.data;
    const failure = start.isError ? failureFrom(start.error) : download.isError ? failureFrom(download.error) : null;
    const close = () => onOpenChange(false);

    const save = (exportId: string) => download.mutate(exportId, { onSuccess: ({ url }) => window.location.assign(url) });

    useEffect(() => {
        if (data?.status !== "ready" || data.rowCount > EXPORT_RULES.instantRows || fetched.current === data.id) return;
        fetched.current = data.id;
        download.mutate(data.id, { onSuccess: ({ url }) => window.location.assign(url) });
    }, [data, download]);

    const begin = () => {
        if (request) start.mutate(request, { onSuccess: (created) => setJobId(created.id) });
    };

    const percent = Math.round((data?.progress ?? 0) * PERCENT);
    const footer = (
        <div className="flex items-center justify-end gap-2">
            <Button tone="ghost" size="sm" onPress={close}>
                {jobId ? SHIPMENTS_COPY.close : UI_COPY.cancel}
            </Button>
            {jobId === null ? (
                <Button size="sm" pending={start.isPending} pendingLabel={copy.pending} isDisabled={!request} onPress={begin}>
                    {copy.confirm}
                </Button>
            ) : null}
            {data?.status === "ready" ? (
                <Button size="sm" icon={Download} pending={download.isPending} onPress={() => save(data.id)}>
                    {copy.download}
                </Button>
            ) : null}
            {data?.status === "expired" && request ? (
                <Button size="sm" onPress={() => setJobId(null)}>
                    {SHIPMENTS_COPY.retry}
                </Button>
            ) : null}
        </div>
    );

    return (
        <Dialog isOpen={isOpen} onOpenChange={onOpenChange} title={copy.title} width="md" footer={footer}>
            <div className="flex flex-col gap-2 text-xs">
                {jobId === null ? (
                    <>
                        <p className="text-text">{pluralize(count, copy.scope)}</p>
                        {count > EXPORT_RULES.instantRows ? <p className="text-text-secondary">{fillTemplate(copy.background, { max: String(EXPORT_RULES.instantRows) })}</p> : null}
                        <p className="text-text-muted">{copy.audited}</p>
                    </>
                ) : (
                    <>
                        <p role="status" className="text-text">
                            {data ? copy.states[data.status] : copy.pending}
                        </p>
                        {data && (data.status === "queued" || data.status === "running") ? (
                            <div role="progressbar" aria-label={copy.states.running} aria-valuemin={0} aria-valuemax={PERCENT} aria-valuenow={percent} className="flex flex-col gap-1.5">
                                <ProgressLine value={data.progress} className="bg-border w-full" />
                                <span className="text-text-muted tabular-nums">{fillTemplate(copy.progress, { percent: String(percent) })}</span>
                            </div>
                        ) : null}
                        {data?.status === "ready" ? (
                            <p className="text-text-secondary font-mono">
                                {fillTemplate(copy.file, { file: data.fileName, rows: grouped(data.rowCount), size: data.sizeBytes === null ? "" : fileSize(data.sizeBytes) })}
                            </p>
                        ) : null}
                    </>
                )}
                {failure ? (
                    <p role="alert" className="text-signal-danger">
                        {errorMessage(failure) || copy.failedRequest}
                    </p>
                ) : null}
            </div>
        </Dialog>
    );
}
