"use client";
import { getLocalTimeZone } from "@internationalized/date";
import { Download } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import DataTable from "@/components/ui/data-table";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { importBusy, useImportBatches, useImportDownload } from "@/lib/hooks/use-bulk-import";
import { IMPORT_PARAM, importFailureText } from "@/lib/loads/imports";
import { shortMoment } from "@/lib/loads/shipments";
import type { TableColumn } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    current: string | null;
    onOpen: (batchId: string) => void;
}

const { history: copy } = IMPORT_COPY;

const summaryOf = ({ counts, outcome }: ImportBatchDto) =>
    outcome
        ? fillTemplate(copy.outcome, { posted: String(outcome.posted), pending: String(outcome.pendingApproval), draft: String(outcome.draft) })
        : fillTemplate(copy.counts, { total: String(counts.total), invalid: String(counts.invalid) });

export default function ImportHistory({ current, onOpen }: Props) {
    const batches = useImportBatches();
    const download = useImportDownload();
    const rows = batches.data?.pages.flatMap((page) => page.items) ?? [];
    const failure = download.isError ? failureFrom(download.error) : null;
    const zone = getLocalTimeZone();

    const columns: TableColumn<ImportBatchDto>[] = [
        { key: "file", label: copy.file, rowHeader: true, cell: (batch) => <span className="text-text">{batch.fileName}</span> },
        { key: "started", label: copy.started, phone: "aside", cell: (batch) => fillTemplate(copy.by, { time: shortMoment(batch.createdAt, zone), name: batch.createdByName }) },
        { key: "status", label: copy.status, cell: (batch) => <StatusLabel {...IMPORT_COPY.statuses[batch.status]} pulse={importBusy(batch)} /> },
        { key: "rows", label: copy.rows, phone: "hidden", cell: summaryOf },
        {
            key: "actions",
            label: copy.open,
            align: "end",
            cell: (batch) => (
                <span className="flex items-center justify-end gap-3">
                    {batch.status === "completed" ? (
                        <>
                            <ButtonLink tone="link" size="sm" href={`${appRoutes.shipments()}${queryString({ [IMPORT_PARAM]: batch.id })}`}>
                                {copy.loads}
                            </ButtonLink>
                            <Button tone="link" size="sm" icon={Download} onPress={() => download.mutate(batch.id, { onSuccess: ({ url }) => window.location.assign(url) })}>
                                {copy.results}
                            </Button>
                        </>
                    ) : null}
                    {batch.id === current ? (
                        <span className="text-text-muted text-xs">{copy.opened}</span>
                    ) : (
                        <Button tone="link" size="sm" onPress={() => onOpen(batch.id)}>
                            {copy.open}
                        </Button>
                    )}
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-2">
            <DataTable
                caption={copy.label}
                count={rows.length > 0 ? rows.length : undefined}
                columns={columns}
                rows={rows}
                rowKey={(batch) => batch.id}
                rowLabel={(batch) => batch.fileName}
                rowSignature={(batch) => `${batch.status}-${batch.version}`}
                loading={batches.isPending}
                failed={batches.isError}
                onRetry={() => void batches.refetch()}
                empty={<p className="text-text-muted text-xs">{copy.none}</p>}
                footer={
                    batches.hasNextPage ? (
                        <Button tone="ghost" size="sm" pending={batches.isFetchingNextPage} onPress={() => void batches.fetchNextPage()}>
                            {copy.more}
                        </Button>
                    ) : undefined
                }
            />
            {failure ? (
                <p role="alert" className="text-error text-xs">
                    {importFailureText(failure)}
                </p>
            ) : null}
        </div>
    );
}
