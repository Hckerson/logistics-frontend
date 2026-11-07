"use client";
import { Download, Share } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { LOAD_FILTER_LIMITS } from "@/lib/loads/shipments";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    picked: number;
    shown: number;
    total?: number;
    matching: boolean;
    onMatching: () => void;
    onShare: () => void;
    onExport: () => void;
}

const { bulk } = SHIPMENTS_COPY;

export default function ShipmentsBulkActions({ picked, shown, total, matching, onMatching, onShare, onExport }: Props) {
    const offerMatching = !matching && total !== undefined && picked === shown && total > shown;
    const shareBlocked = matching || picked > LOAD_FILTER_LIMITS.ids;

    return (
        <>
            {offerMatching ? (
                <Button tone="link" size="inline" onPress={onMatching}>
                    {fillTemplate(bulk.selectMatching, { count: grouped(total ?? 0) })}
                </Button>
            ) : null}
            {matching && total !== undefined ? <span className="text-text-secondary text-xs">{fillTemplate(bulk.matching, { count: grouped(total) })}</span> : null}
            {picked >= LOAD_FILTER_LIMITS.exportIds ? <span className="text-signal-warning text-xs">{fillTemplate(bulk.selectionLimit, { max: grouped(LOAD_FILTER_LIMITS.exportIds) })}</span> : null}
            <Button
                tone="outline"
                size="sm"
                icon={Share}
                disabledReason={shareBlocked ? fillTemplate(bulk.shareLimit, { max: String(LOAD_FILTER_LIMITS.ids) }) : undefined}
                onPress={onShare}
            >
                {bulk.share}
            </Button>
            <Button tone="outline" size="sm" icon={Download} onPress={onExport}>
                {bulk.export}
            </Button>
        </>
    );
}
