"use client";
import { useEffect, useState } from "react";
import ShipmentsChips from "@/components/common/shipments-chips";
import ShipmentsEmpty from "@/components/common/shipments-empty";
import ShipmentsFilterPanel from "@/components/common/shipments-filter-panel";
import ShipmentsTable from "@/components/common/shipments-table";
import ShipmentsTools from "@/components/common/shipments-tools";
import Tabs from "@/components/ui/tabs";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useLoadFacets } from "@/lib/hooks/use-load-facets";
import { useLoadList } from "@/lib/hooks/use-load-list";
import { useLoadCounts } from "@/lib/hooks/use-loads";
import { useWide } from "@/lib/hooks/use-wide";
import { QUICK_FIND } from "@/lib/loads/constants";
import { appliedFilters, panelCount, withoutFilter } from "@/lib/loads/shipment-search";
import { listParams, loadSort, NO_SHIPMENT_FILTERS, refinements, SHIPMENT_STAGES, shipmentQuery, stageCount, tableSort } from "@/lib/loads/shipments";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";
import type { ShipmentFilters, ShipmentParam } from "@/lib/types";

interface Props {
    initial: ShipmentFilters;
    reset: readonly ShipmentParam[];
}

const { stages, paramNames } = SHIPMENTS_COPY;

export default function ShipmentsBoard({ initial, reset }: Props) {
    const [filters, setFilters] = useState(initial);
    const [open, setOpen] = useState<string | null>(null);
    const [panel, setPanel] = useState({ open: false, key: 0 });
    const { search, setSearch, debouncedSearch } = useDebouncedSearch(initial.q, QUICK_FIND.debounceMs);
    const applied: ShipmentFilters = { ...filters, q: debouncedSearch.trim() };
    const list = useLoadList(listParams(applied));
    const counts = useLoadCounts();
    const facets = useLoadFacets();
    const wide = useWide();
    const query = shipmentQuery(applied);
    const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
    const total = list.data?.pages[0]?.total;
    const tabs = SHIPMENT_STAGES.map((id) => ({ id, label: stages[id], count: counts.data ? stageCount(id, counts.data) : undefined }));
    const [dropped, setDropped] = useState(reset);

    useEffect(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    }, [query]);

    const change = (next: Partial<ShipmentFilters>) => {
        setFilters((current) => ({ ...current, ...next }));
        setDropped([]);
    };
    const pickStage = (id: string) => change({ stage: SHIPMENT_STAGES.find((stage) => stage === id) ?? "all" });
    const clear = (keepStage: boolean) => {
        change({ ...NO_SHIPMENT_FILTERS, stage: keepStage ? filters.stage : NO_SHIPMENT_FILTERS.stage, sort: filters.sort });
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
            />
            <ShipmentsChips applied={appliedFilters(filters, facets.data?.carriers ?? [])} onRemove={(id) => change(withoutFilter(id))} onClear={() => clear(true)} />
            {dropped.length > 0 ? (
                <p role="status" className="text-signal-warning text-xs">
                    {fillTemplate(pluralize(dropped.length, SHIPMENTS_COPY.reset), { names: [...new Set(dropped)].map((param) => paramNames[param]).join(", ") })}
                </p>
            ) : null}
            <Tabs tabs={tabs} selected={filters.stage} onSelect={pickStage} label={SHIPMENTS_COPY.stagesLabel}>
                {() => (
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
                        empty={<ShipmentsEmpty filters={refinements(applied) + Number(applied.stage !== "all")} onClear={() => clear(false)} />}
                    />
                )}
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
            <p role="status" className="sr-only">
                {total === undefined ? "" : pluralize(total, SHIPMENTS_COPY.results)}
            </p>
        </div>
    );
}
