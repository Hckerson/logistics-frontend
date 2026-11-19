import { Upload } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";

interface Props {
    batch: ImportBatchDto;
    onRestart: () => void;
}

const { failed: copy } = IMPORT_COPY;

export default function ImportFailed({ batch, onRestart }: Props) {
    return (
        <Panel label={copy.label} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col items-start gap-3">
                <p role="alert" className="text-error text-xs">
                    {batch.problem?.message}
                </p>
                <Button tone="outline" size="sm" icon={Upload} onPress={onRestart}>
                    {copy.retry}
                </Button>
            </div>
        </Panel>
    );
}
