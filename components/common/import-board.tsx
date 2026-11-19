"use client";
import { useEffect, useState } from "react";
import { Add } from "@carbon/icons-react";
import ImportHistory from "@/components/common/import-history";
import ImportStage from "@/components/common/import-stage";
import ImportSteps from "@/components/common/import-steps";
import Button from "@/components/ui/button";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { useImportBatch } from "@/lib/hooks/use-bulk-import";
import { IMPORT_PARAM, IMPORT_STEP_OF } from "@/lib/loads/imports";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    initial: string | null;
}

export default function ImportBoard({ initial }: Props) {
    const [open, setOpen] = useState({ batchId: initial, reused: false });
    const batch = useImportBatch(open.batchId);
    const step = batch.data ? IMPORT_STEP_OF[batch.data.status] : "upload";

    useEffect(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${queryString({ [IMPORT_PARAM]: open.batchId ?? undefined })}`);
    }, [open.batchId]);

    const show = (batchId: string | null, reused = false) => setOpen({ batchId, reused });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 max-sm:hidden">
                <ImportSteps current={step} />
                {open.batchId ? (
                    <Button tone="outline" size="sm" icon={Add} onPress={() => show(null)}>
                        {IMPORT_COPY.another}
                    </Button>
                ) : null}
            </div>
            <p className="border-border text-text-secondary border px-3 py-2 text-xs sm:hidden">{IMPORT_COPY.phone}</p>
            {open.reused ? (
                <p role="status" className="border-signal-info-edge bg-signal-info-wash text-signal-info border px-3 py-2 text-xs">
                    {IMPORT_COPY.intake.reused}
                </p>
            ) : null}
            <div className="max-sm:hidden">
                <ImportStage key={open.batchId ?? "new"} batchId={open.batchId} query={batch} onOpen={show} />
            </div>
            <ImportHistory current={open.batchId} onOpen={(batchId) => show(batchId)} />
        </div>
    );
}
