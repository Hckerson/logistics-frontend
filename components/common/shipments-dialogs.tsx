"use client";
import ShipmentsExportDialog from "@/components/common/shipments-export-dialog";
import ShipmentsShareDialog from "@/components/common/shipments-share-dialog";
import type { LoadExportRequestDto } from "@/lib/contract/schemas";
import { exportFilters } from "@/lib/loads/shipments";
import type { ShipmentDialog, ShipmentFilters } from "@/lib/types";

interface Props {
    dialog: ShipmentDialog;
    onClose: () => void;
    picked: ReadonlySet<string>;
    matching: boolean;
    total?: number;
    filters: ShipmentFilters;
}

const FORMAT = "csv";

export default function ShipmentsDialogs({ dialog, onClose, picked, matching, total, filters }: Props) {
    const loadIds = [...picked];
    const request: LoadExportRequestDto | null = matching
        ? { format: FORMAT, filters: exportFilters(filters) }
        : loadIds.length > 0
          ? { format: FORMAT, loadIds }
          : null;
    const settle = (isOpen: boolean) => {
        if (!isOpen) onClose();
    };

    return (
        <>
            <ShipmentsShareDialog key={`share-${dialog.key}`} isOpen={dialog.kind === "share"} onOpenChange={settle} loadIds={dialog.ids ?? loadIds} />
            <ShipmentsExportDialog
                key={`export-${dialog.key}`}
                isOpen={dialog.kind === "export"}
                onOpenChange={settle}
                request={request}
                count={matching ? (total ?? 0) : loadIds.length}
                initialJob={dialog.job}
            />
        </>
    );
}
