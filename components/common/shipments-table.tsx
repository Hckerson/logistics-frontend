"use client";
import type { ReactNode } from "react";
import { Copy, Launch } from "@carbon/icons-react";
import { shipmentColumns } from "@/components/common/shipment-columns";
import ShipmentPreview from "@/components/common/shipment-preview";
import UpdatedAge from "@/components/common/updated-age";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/ui/pagination";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import type { MenuEntry, TableSort } from "@/lib/types";

interface Props {
    rows: readonly LoadSummaryDto[];
    total?: number;
    updatedAt: number;
    loading: boolean;
    failed: boolean;
    onRetry: () => void;
    sort?: TableSort;
    onSortChange: (sort: TableSort) => void;
    open: string | null;
    onOpen: (key: string | null) => void;
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
    empty: ReactNode;
}

const { menu } = SHIPMENTS_COPY;

const menuItems = (row: LoadSummaryDto): readonly MenuEntry[] => [
    { id: "open", label: menu.open, icon: Launch, href: appRoutes.load(row.id) },
    { id: "copy", label: menu.copy, icon: Copy },
];

const act = (row: LoadSummaryDto, action: string) => {
    if (action === "copy") navigator.clipboard.writeText(row.id).catch(() => undefined);
};

export default function ShipmentsTable(props: Props) {
    const { rows, total, updatedAt, loading, failed, onRetry, sort, onSortChange, open, onOpen, hasMore, loadingMore, onLoadMore, empty } = props;

    return (
        <DataTable
            caption={SHIPMENTS_COPY.caption}
            count={total}
            note={<UpdatedAge at={updatedAt} template={SHIPMENTS_COPY.updated} />}
            columns={shipmentColumns(updatedAt)}
            rows={rows}
            rowKey={(row) => row.id}
            rowSignature={(row) => `${row.status}:${row.eta?.late ?? false}`}
            sort={sort}
            onSortChange={onSortChange}
            menu={{ items: menuItems, onAction: act }}
            preview={{ open, onOpen, render: (row) => <ShipmentPreview load={row} now={updatedAt} /> }}
            loading={loading}
            failed={failed}
            onRetry={onRetry}
            empty={empty}
            footer={
                rows.length > 0 ? (
                    <Pagination mode="more" shown={rows.length} total={total} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={onLoadMore} />
                ) : undefined
            }
        />
    );
}
