"use client";
import { useState, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import ImportFailed from "@/components/common/import-failed";
import ImportIntake from "@/components/common/import-intake";
import ImportMapping from "@/components/common/import-mapping";
import ImportPricing from "@/components/common/import-pricing";
import ImportProgress from "@/components/common/import-progress";
import ImportResult from "@/components/common/import-result";
import ImportReview from "@/components/common/import-review";
import SectionState from "@/components/common/section-state";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import type { ImportStatus } from "@/lib/types";

interface Props {
    batchId: string | null;
    query: UseQueryResult<ImportBatchDto>;
    onOpen: (batchId: string | null, reused?: boolean) => void;
}

export default function ImportStage({ batchId, query, onOpen }: Props) {
    const [editingAt, setEditingAt] = useState<number | null>(null);

    if (batchId === null) return <ImportIntake onStarted={onOpen} />;

    return (
        <SectionState label={IMPORT_COPY.title} query={query}>
            {(batch) => {
                const progress = <ImportProgress batch={batch} />;
                const editing = editingAt === batch.version;
                const views: Record<ImportStatus, ReactNode> = {
                    awaitingUpload: <ImportIntake onStarted={onOpen} />,
                    parsing: progress,
                    validating: progress,
                    pricing: progress,
                    confirming: progress,
                    failed: <ImportFailed batch={batch} onRestart={() => onOpen(null)} />,
                    mapping: <ImportMapping key={batch.id} batch={batch} />,
                    review: <ImportReview batch={batch} />,
                    priced: editing ? <ImportReview batch={batch} onBack={() => setEditingAt(null)} /> : <ImportPricing batch={batch} onEdit={() => setEditingAt(batch.version)} />,
                    completed: <ImportResult batch={batch} />,
                };
                return views[batch.status];
            }}
        </SectionState>
    );
}
