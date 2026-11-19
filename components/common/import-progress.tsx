import Panel from "@/components/ui/panel";
import ProgressLine from "@/components/ui/progress-line";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import type { ImportStatus } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    batch: ImportBatchDto;
}

const { progress: copy } = IMPORT_COPY;
const TITLES: Partial<Record<ImportStatus, string>> = copy.titles;

export default function ImportProgress({ batch }: Props) {
    const title = TITLES[batch.status] ?? copy.label;

    return (
        <Panel label={title} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col gap-2">
                <p role="status" className="sr-only">
                    {title}
                </p>
                <ProgressLine value={batch.progress} />
                <p className="text-text-secondary font-mono text-xs tabular-nums">
                    {fillTemplate(copy.rows, { processed: String(batch.processed), total: String(batch.rowCount) })}
                </p>
                <p className="text-text-muted text-xs">{copy.leave}</p>
            </div>
        </Panel>
    );
}
