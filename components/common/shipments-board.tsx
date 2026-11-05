"use client";
import { useEffect, useState } from "react";
import { Copy, Launch } from "@carbon/icons-react";
import { shipmentColumns } from "@/components/common/shipment-columns";
import ShipmentPreview from "@/components/common/shipment-preview";
import ShipmentsEmpty from "@/components/common/shipments-empty";
import ShipmentsTools from "@/components/common/shipments-tools";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/ui/pagination";
import Tabs from "@/components/ui/tabs";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useLoadList } from "@/lib/hooks/use-load-list";
import { useLoadCounts } from "@/lib/hooks/use-loads";
import { QUICK_FIND } from "@/lib/loads/constants";
import { listParams, NO_SHIPMENT_FILTERS, refinements, SHIPMENT_STAGES, shipmentQuery, stageCount } from "@/lib/loads/shipments";
import { pluralize } from "@/lib/utils/plural";
import type { MenuEntry, ShipmentFilters } from "@/lib/types";

interface Props {
    initial: ShipmentFilters;
}

const { menu, stages } = SHIPMENTS_COPY;

const menuItems = (row: LoadSummaryDto): readonly MenuEntry[] => [
    { id: "open", label: menu.open, icon: Launch, href: appRoutes.load(row.id) },
    { id: "copy", label: menu.copy, icon: Copy },
];

const act = (row: LoadSummaryDto, action: string) => {
    if (action === "copy") navigator.clipboard.writeText(row.id).catch(() => undefined);
};

export default function ShipmentsBoard({ initial }: Props) {
    const [filters, setFilters] = useState(initial);
    const [open, setOpen] = useState<string | null>(null);
    const { search, setSearch, debouncedSearch } = useDebouncedSearch(initial.q, QUICK_FIND.debounceMs);
    const applied: ShipmentFilters = { ...filters, q: debouncedSearch.trim() };
    const list = useLoadList(listParams(applied));
    const counts = useLoadCounts();
    const query = shipmentQuery(applied);
    const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
    const now = list.dataUpdatedAt;
    const total = counts.data && refinements(applied) === 0 ? stageCount(applied.stage, counts.data) : undefined;
    const tabs = SHIPMENT_STAGES.map((id) => ({ id, label: stages[id], count: counts.data ? stageCount(id, counts.data) : undefined }));

    useEffect(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    }, [query]);

    const change = (next: Partial<ShipmentFilters>) => setFilters((current) => ({ ...current, ...next }));
    const pickStage = (id: string) => change({ stage: SHIPMENT_STAGES.find((stage) => stage === id) ?? "all" });
    const clear = () => {
        setFilters(NO_SHIPMENT_FILTERS);
        setSearch("");
    };

    return (
        <div className="flex flex-col gap-3">
            <ShipmentsTools search={search} onSearch={setSearch} filters={filters} onChange={change} />
            <Tabs tabs={tabs} selected={filters.stage} onSelect={pickStage} label={SHIPMENTS_COPY.stagesLabel}>
                {() => (
                    <DataTable
                        caption={SHIPMENTS_COPY.caption}
                        count={total}
                        columns={shipmentColumns(now)}
                        rows={rows}
                        rowKey={(row) => row.id}
                        rowSignature={(row) => `${row.status}:${row.eta?.late ?? false}`}
                        menu={{ items: menuItems, onAction: act }}
                        preview={{ open, onOpen: setOpen, render: (row) => <ShipmentPreview load={row} now={now} /> }}
                        loading={list.isPending || list.isPlaceholderData}
                        failed={list.isError}
                        onRetry={() => void list.refetch()}
                        empty={<ShipmentsEmpty filters={refinements(applied) + Number(applied.stage !== "all")} onClear={clear} />}
                        footer={
                            rows.length > 0 ? (
                                <Pagination
                                    mode="more"
                                    shown={rows.length}
                                    total={total}
                                    hasMore={list.hasNextPage}
                                    loadingMore={list.isFetchingNextPage}
                                    onLoadMore={() => void list.fetchNextPage()}
                                />
                            ) : undefined
                        }
                    />
                )}
            </Tabs>
            <p role="status" className="sr-only">
                {list.isPending ? "" : pluralize(rows.length, SHIPMENTS_COPY.results)}
            </p>
        </div>
    );
}
