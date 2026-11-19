"use client";
import { useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Close, Undo } from "@carbon/icons-react";
import { IMPORT_ROW_COLUMNS } from "@/components/common/import-row-columns";
import ImportRowEditor from "@/components/common/import-row-editor";
import Button from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import Panel from "@/components/ui/panel";
import Tabs from "@/components/ui/tabs";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { ImportBatchDto, ImportCountsDto, ImportRowDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_REVIEW_COPY } from "@/lib/data/loads/import-review-copy";
import { importKeys, useImportRows } from "@/lib/hooks/use-bulk-import";
import { useExcludeImportRows, usePriceImportBatch } from "@/lib/hooks/use-import-actions";
import { IMPORT_OUTCOMES, importFailureText } from "@/lib/loads/imports";
import type { ImportOutcome } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    batch: ImportBatchDto;
    onBack?: () => void;
}

type Filter = ImportOutcome | "all";

const copy = IMPORT_REVIEW_COPY;
const FILTERS: readonly Filter[] = [...IMPORT_OUTCOMES, "all"];
const countOf = (counts: ImportCountsDto, filter: Filter) => (filter === "all" ? counts.total : counts[filter]);
const words = (counts: ImportCountsDto) => Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, String(value)]));

export default function ImportReview({ batch, onBack }: Props) {
    const [filter, setFilter] = useState<Filter>(batch.counts.invalid > 0 ? "invalid" : "all");
    const [open, setOpen] = useState<string | null>(null);
    const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
    const rows = useImportRows(batch.id, filter === "all" ? null : filter);
    const exclude = useExcludeImportRows(batch.id);
    const price = usePriceImportBatch(batch.id);
    const syncing = useIsFetching({ queryKey: importKeys.batch(batch.id) }) > 0;
    const announce = useAnnounce();
    const items = rows.data?.pages.flatMap((page) => page.items) ?? [];
    const { counts } = batch;
    const ready = counts.valid + counts.warning;
    const failure = exclude.isError ? failureFrom(exclude.error) : price.isError ? failureFrom(price.error) : null;

    const toggle = (rowIds: readonly string[], excluded: boolean) =>
        exclude.mutate(
            { rowIds: [...rowIds], excluded },
            {
                onSuccess: (next) => {
                    setPicked(new Set());
                    announce({ message: fillTemplate(copy.counted, words(next.counts)) });
                },
            },
        );

    const nextProblem = (rowId: string) => {
        const after = items.slice(items.findIndex((row) => row.id === rowId) + 1);
        setOpen([...after, ...items].find((row) => row.id !== rowId && !row.excluded && row.outcome === "invalid")?.id ?? null);
    };

    const pick = (id: string) => {
        setFilter(FILTERS.find((option) => option === id) ?? "all");
        setOpen(null);
        setPicked(new Set());
    };

    const bulk = (keys: ReadonlySet<string>) => {
        const including = filter === "excluded";
        return (
            <Button tone="outline" size="sm" icon={including ? Undo : Close} pending={exclude.isPending} onPress={() => toggle([...keys], !including)}>
                {pluralize(keys.size, including ? copy.include : copy.exclude)}
            </Button>
        );
    };

    const menuOf = (row: ImportRowDto) => [
        { id: "fix", label: copy.menu.fix },
        row.excluded ? { id: "include", label: copy.menu.include } : { id: "exclude", label: copy.menu.exclude },
    ];

    const act = (row: ImportRowDto, action: string) => (action === "fix" ? setOpen(row.id) : toggle([row.id], action === "exclude"));

    const blocked = counts.invalid > 0 ? pluralize(counts.invalid, copy.fixFirst) : ready === 0 ? copy.nothing : undefined;

    return (
        <Panel label={copy.label} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col gap-3">
                <Tabs tabs={FILTERS.map((id) => ({ id, label: copy.tabs[id], count: countOf(counts, id) }))} selected={filter} onSelect={pick} label={copy.filter}>
                    {() => (
                        <DataTable
                            caption={fillTemplate(copy.caption, { file: batch.fileName })}
                            count={countOf(counts, filter)}
                            columns={IMPORT_ROW_COLUMNS}
                            rows={items}
                            rowKey={(row) => row.id}
                            rowLabel={(row) => fillTemplate(copy.rowLabel, { line: String(row.line), reference: row.values.reference })}
                            rowSignature={(row) => `${row.version}-${row.outcome}-${String(row.excluded)}`}
                            selection={{ keys: picked, onChange: setPicked, actions: bulk }}
                            menu={{ items: menuOf, onAction: act }}
                            preview={{
                                open,
                                onOpen: setOpen,
                                render: (row) => <ImportRowEditor key={row.id} batchId={batch.id} row={row} onNext={() => nextProblem(row.id)} onClose={() => setOpen(null)} />,
                            }}
                            loading={rows.isPending}
                            failed={rows.isError}
                            onRetry={() => void rows.refetch()}
                            empty={<p className="text-text-muted text-xs">{filter === "invalid" ? copy.noneToFix : copy.none}</p>}
                            footer={
                                rows.hasNextPage ? (
                                    <Button tone="ghost" size="sm" pending={rows.isFetchingNextPage} onPress={() => void rows.fetchNextPage()}>
                                        {copy.showMore}
                                    </Button>
                                ) : undefined
                            }
                        />
                    )}
                </Tabs>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-text-secondary text-xs tabular-nums">{fillTemplate(copy.summary, words(counts))}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        {onBack ? (
                            <Button tone="outline" onPress={onBack}>
                                {copy.back}
                            </Button>
                        ) : null}
                        <Button pending={price.isPending || syncing} pendingLabel={copy.pricing} disabledReason={blocked} onPress={() => price.mutate({ version: batch.version })}>
                            {pluralize(ready, copy.price)}
                        </Button>
                    </div>
                </div>
                {onBack ? <p className="text-text-muted text-xs">{copy.repriced}</p> : null}
                {failure ? (
                    <p role="alert" className="text-error text-xs">
                        {importFailureText(failure, { precondition: IMPORT_COPY.stale, conflict: blocked ?? IMPORT_COPY.stale })}
                    </p>
                ) : null}
            </div>
        </Panel>
    );
}
