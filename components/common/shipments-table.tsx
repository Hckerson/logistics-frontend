"use client";
import type { ReactNode } from "react";
import { Copy, Launch, Share } from "@carbon/icons-react";
import ShipmentActionDialog from "@/components/common/shipment-action-dialog";
import { shipmentColumns } from "@/components/common/shipment-columns";
import ShipmentPreview from "@/components/common/shipment-preview";
import UpdatedAge from "@/components/common/updated-age";
import { useSession } from "@/components/providers/session-provider";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/ui/pagination";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { stepKey, useRowSteps } from "@/lib/hooks/use-row-steps";
import type { MenuEntry, TableSelection, TableSort } from "@/lib/types";

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
    selection: TableSelection;
    onShare: (loadId: string) => void;
}

const { menu } = SHIPMENTS_COPY;

const STANDING = (row: LoadSummaryDto): MenuEntry[] => [
    { id: "open", label: menu.open, icon: Launch, href: appRoutes.load(row.id) },
    { id: "copy", label: menu.copy, icon: Copy },
    { id: "share", label: menu.share, icon: Share },
];

export default function ShipmentsTable(props: Props) {
    const { rows, total, updatedAt, loading, failed, onRetry, sort, onSortChange, open, onOpen } = props;
    const { hasMore, loadingMore, onLoadMore, empty, selection, onShare } = props;
    const steps = useRowSteps(useSession()?.roles ?? []);

    const items = (row: LoadSummaryDto): readonly MenuEntry[] => {
        if (row.id !== steps.menuFor) return STANDING(row);
        if (!steps.loaded) return [{ id: "loading", label: menu.loading, pending: true }, ...STANDING(row)];
        return [...steps.steps.map((step) => ({ id: stepKey(step), label: step.label, destructive: step.destructive })), ...STANDING(row)];
    };

    const act = (row: LoadSummaryDto, action: string) => {
        if (action === "copy") navigator.clipboard.writeText(row.id).catch(() => undefined);
        if (action === "share") onShare(row.id);
        steps.choose(action);
    };

    return (
        <>
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
                selection={selection}
                menu={{ items, onAction: act, onOpenChange: (row, isOpen) => (isOpen ? steps.open(row.id) : undefined) }}
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
            {steps.loaded ? (
                <ShipmentActionDialog key={steps.chosen ? stepKey(steps.chosen) : "closed"} load={steps.loaded} action={steps.chosen} onClose={steps.dismiss} />
            ) : null}
        </>
    );
}
