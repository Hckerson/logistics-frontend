"use client";
import { useState } from "react";
import { Download } from "@carbon/icons-react";
import ImportDictionary from "@/components/common/import-dictionary";
import Button from "@/components/ui/button";
import FileDrop from "@/components/ui/file-drop";
import Panel from "@/components/ui/panel";
import ProgressLine from "@/components/ui/progress-line";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { useImportDownload } from "@/lib/hooks/use-bulk-import";
import { useImportUpload } from "@/lib/hooks/use-import-actions";
import { IMPORT_RULES, importFailureText } from "@/lib/loads/imports";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { BYTES_PER_MEGABYTE } from "@/lib/utils/format-number";

interface Props {
    onStarted: (batchId: string, reused: boolean) => void;
}

const { intake: copy } = IMPORT_COPY;

export default function ImportIntake({ onStarted }: Props) {
    const upload = useImportUpload();
    const template = useImportDownload();
    const announce = useAnnounce();
    const [name, setName] = useState("");
    const [rejected, setRejected] = useState<string[]>([]);
    const failure = upload.isError ? failureFrom(upload.error) : template.isError ? failureFrom(template.error) : null;
    const uploading = fillTemplate(copy.uploading, { name });

    const receive = (files: File[]) => {
        const file = files.at(0);
        if (!file) return;
        setRejected([]);
        setName(file.name);
        upload.mutate(file, {
            onSuccess: ({ created, batch }) => {
                const reused = created !== batch.id;
                announce({ message: reused ? copy.reused : fillTemplate(copy.uploaded, { name: file.name }) });
                onStarted(batch.id, reused);
            },
        });
    };

    const downloadTemplate = () => template.mutate(null, { onSuccess: ({ url }) => window.location.assign(url) });

    return (
        <Panel
            label={copy.label}
            aside={
                <Button tone="outline" size="sm" icon={Download} pending={template.isPending} onPress={downloadTemplate}>
                    {copy.template}
                </Button>
            }
        >
            <div className="flex flex-col gap-3">
                <p className="text-text-secondary text-xs">{copy.lead}</p>
                <FileDrop
                    label={copy.drop}
                    accept={IMPORT_RULES.contentTypes}
                    maxSizeMb={IMPORT_RULES.maxBytes / BYTES_PER_MEGABYTE}
                    maxFiles={1}
                    multiple={false}
                    disabledReason={upload.isPending ? uploading : undefined}
                    onFiles={receive}
                    onReject={setRejected}
                />
                {upload.isPending ? (
                    <div className="flex flex-col gap-1.5">
                        <ProgressLine value={upload.progress} />
                        <p role="status" className="text-text-muted text-xs">
                            {uploading}
                        </p>
                    </div>
                ) : null}
                {[...rejected, ...(failure ? [importFailureText(failure)] : [])].map((message) => (
                    <p key={message} role="alert" className="text-error text-xs">
                        {message}
                    </p>
                ))}
                <ImportDictionary />
            </div>
        </Panel>
    );
}
