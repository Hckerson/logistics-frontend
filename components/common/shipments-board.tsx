"use client";
import { useEffect, useState } from "react";
import ShipmentsBulkActions from "@/components/common/shipments-bulk-actions";
import ShipmentsChips from "@/components/common/shipments-chips";
import ShipmentsDialogs from "@/components/common/shipments-dialogs";
import ShipmentsEmpty from "@/components/common/shipments-empty";
import ShipmentsFilterPanel from "@/components/common/shipments-filter-panel";
import ShipmentsMap from "@/components/common/shipments-map";
import ShipmentsReset from "@/components/common/shipments-reset";
import ShipmentsTable from "@/components/common/shipments-table";
import ShipmentsTools from "@/components/common/shipments-tools";
import Tabs from "@/components/ui/tabs";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { useImportBatch } from "@/lib/hooks/use-bulk-import";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useLoadFacets } from "@/lib/hooks/use-load-facets";
import { useLoadList } from "@/lib/hooks/use-load-list";
import { useLoadCounts } from "@/lib/hooks/use-loads";
import { useShipmentPositions } from "@/lib/hooks/use-shipment-positions";
import { useShipmentSelection } from "@/lib/hooks/use-shipment-selection";
import { useWide } from "@/lib/hooks/use-wide";
import { QUICK_FIND, TRACKED_STATUSES } from "@/lib/loads/constants";
import { appliedFilters, panelCount, withoutFilter } from "@/lib/loads/shipment-search";
import { listParams, loadSort, NO_SHIPMENT_FILTERS, refinements, SHIPMENT_STAGES, shipmentQuery, stageCount, tableSort } from "@/lib/loads/shipments";
import { pluralize } from "@/lib/utils/plural";
import type { ShipmentDialog, ShipmentFilters, ShipmentParam } from "@/lib/types";

interface Props {
    initial: ShipmentFilters;
    reset: readonly ShipmentParam[];
    exportId: string | null;
}

const { stages } = SHIPMENTS_COPY;

export default function ShipmentsBoard({ initial, reset, exportId }: Props) {
    const [filters, setFilters] = useState(initial);
    const [open, setOpen] = useState<string | null>(null);
    const [panel, setPanel] = useState({ open: false, key: 0 });
    const { search, setSearch, debouncedSearch } = useDebouncedSearch(initial.q, QUICK_FIND.debounceMs);
    const applied: ShipmentFilters = { ...filters, q: debouncedSearch.trim() };
    const list = useLoadList(listParams(applied));
    const counts = useLoadCounts();
    const facets = useLoadFacets();
    const imported = useImportBatch(filters.batch);
    const wide = useWide();
    const query = shipmentQuery(applied);
    const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
    const total = list.data?.pages[0]?.total;
    const tabs = SHIPMENT_STAGES.map((id) => ({ id, label: stages[id], count: counts.data ? stageCount(id, counts.data) : undefined }));
    const [dropped, setDropped] = useState(reset);
    const choose = useShipmentSelection(rows.map((row) => row.id));
    const positions = useShipmentPositions(rows.filter((row) => TRACKED_STATUSES.includes(row.status)).map((row) => row.id), filters.view === "map");
    const narrowed = refinements(applied) + Number(applied.stage !== "all");
    const [dialog, setDialog] = useState<ShipmentDialog>({ kind: exportId ? "export" : null, key: 0, job: exportId, ids: null });
    const openDialog = (kind: "share" | "export", ids: readonly string[] | null = null) => setDialog((current) => ({ kind, key: current.key + 1, job: null, ids }));

    useEffect(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    }, [query]);

    const change = (next: Partial<ShipmentFilters>) => {
        setFilters((current) => ({ ...current, ...next }));
        setDropped([]);
        choose.release();
    };
    const pickStage = (id: string) => change({ stage: SHIPMENT_STAGES.find((stage) => stage === id) ?? "all" });
    const clear = (keepStage: boolean) => {
        change({ ...NO_SHIPMENT_FILTERS, stage: keepStage ? filters.stage : NO_SHIPMENT_FILTERS.stage, sort: filters.sort, view: filters.view });
        setSearch("");
    };

    return (
        <div className="flex flex-col gap-3">
            <ShipmentsTools
                search={search}
                onSearch={setSearch}
                late={filters.late}
                onLate={(late) => change({ late })}
                more={panelCount(filters)}
                onMore={() => setPanel((current) => ({ open: true, key: current.key + 1 }))}
                view={filters.view}
                onView={(view) => change({ view })}
            />
            <ShipmentsChips applied={appliedFilters(filters, facets.data?.carriers ?? [], imported.data?.fileName ?? null)} onRemove={(id) => change(withoutFilter(id))} onClear={() => clear(true)} />
            <ShipmentsReset dropped={dropped} />
            <Tabs tabs={tabs} selected={filters.stage} onSelect={pickStage} label={SHIPMENTS_COPY.stagesLabel}>
                {() =>
                    filters.view === "map" ? (
                        <ShipmentsMap rows={rows} positions={positions.data} loading={list.isPending || positions.isLoading} updatedAt={positions.dataUpdatedAt} filters={narrowed} />
                    ) : (
                        <ShipmentsTable
                            rows={rows}
                            total={total}
                            updatedAt={list.dataUpdatedAt}
                            loading={list.isPending || list.isPlaceholderData}
                            failed={list.isError}
                            onRetry={() => void list.refetch()}
                            sort={tableSort(filters.sort)}
                            onSortChange={(sort) => change({ sort: loadSort(sort) })}
                            open={open}
                            onOpen={setOpen}
                            hasMore={list.hasNextPage}
                            loadingMore={list.isFetchingNextPage}
                            onLoadMore={() => void list.fetchNextPage()}
                            onShare={(loadId) => openDialog("share", [loadId])}
                            selection={{
                                keys: choose.picked,
                                onChange: choose.select,
                                count: choose.matching ? total : undefined,
                                actions: () => (
                                    <ShipmentsBulkActions
                                        picked={choose.picked.size}
                                        shown={rows.length}
                                        total={total}
                                        matching={choose.matching}
                                        onMatching={choose.selectMatching}
                                        onShare={() => openDialog("share")}
                                        onExport={() => openDialog("export")}
                                    />
                                ),
                            }}
                            empty={<ShipmentsEmpty filters={narrowed} onClear={() => clear(false)} />}
                        />
                    )
                }
            </Tabs>
            <ShipmentsFilterPanel
                key={panel.key}
                isOpen={panel.open}
                onOpenChange={(isOpen) => setPanel((current) => ({ ...current, open: isOpen }))}
                filters={filters}
                facets={facets.data}
                wide={wide}
                onApply={change}
            />
            <ShipmentsDialogs
                dialog={dialog}
                onClose={() => setDialog((current) => ({ ...current, kind: null }))}
                picked={choose.picked}
                matching={choose.matching}
                total={total}
                filters={applied}
            />
            <p role="status" className="sr-only">
                {total === undefined ? "" : pluralize(total, SHIPMENTS_COPY.results)}
            </p>
        </div>
    );
}
