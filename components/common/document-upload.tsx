"use client";
import { nanoid } from "nanoid";
import { useId, useState } from "react";
import Field from "@/components/ui/field";
import FileDrop from "@/components/ui/file-drop";
import FileRow from "@/components/ui/file-row";
import Select from "@/components/ui/select";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { DocumentDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useDocumentUpload } from "@/lib/hooks/use-documents";
import { DOCUMENT_CONTENT_TYPES, DOCUMENT_RULES } from "@/lib/loads/constants";
import type { ChoiceOption, UploadRow } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { BYTES_PER_MEGABYTE } from "@/lib/utils/format-number";

interface Props {
    loadId: string;
}

const { documents: copy } = LOAD_RECORD_COPY;
const TYPE_OPTIONS: ChoiceOption<DocumentDto["type"]>[] = copy.uploadable.map((value) => ({ value, label: copy.types[value] }));

export default function DocumentUpload({ loadId }: Props) {
    const upload = useDocumentUpload(loadId);
    const announce = useAnnounce();
    const typeId = useId();
    const [type, setType] = useState<DocumentDto["type"] | null>(null);
    const [rows, setRows] = useState<UploadRow[]>([]);
    const [rejected, setRejected] = useState<string[]>([]);

    const patch = (key: string, next: Partial<UploadRow> | null) =>
        setRows((current) => (next === null ? current.filter((row) => row.key !== key) : current.map((row) => (row.key === key ? { ...row, ...next } : row))));

    const send = async (queue: readonly UploadRow[]) => {
        for (const row of queue) {
            patch(row.key, { state: "uploading", message: undefined });
            try {
                await upload.mutateAsync({ file: row.file, type: row.type });
                patch(row.key, null);
                announce({ message: fillTemplate(copy.uploaded, { name: row.file.name }) });
            } catch (error) {
                const failure = failureFrom(error);
                patch(row.key, { state: "failed", message: failure ? errorMessage(failure) : ERROR_COPY.offline });
            }
        }
    };

    const receive = (files: File[]) => {
        if (!type) return;
        setRejected([]);
        const queue = files.map((file): UploadRow => ({ key: nanoid(), file, type, state: "uploading" }));
        setRows((current) => [...current, ...queue]);
        void send(queue);
    };

    return (
        <div className="border-border flex flex-col gap-3 border-t pt-3">
            <Field id={typeId} label={copy.type}>
                {(control) => <Select {...control} options={TYPE_OPTIONS} value={type} onChange={setType} placeholder={copy.typePlaceholder} />}
            </Field>
            <FileDrop
                label={copy.drop}
                accept={DOCUMENT_CONTENT_TYPES}
                maxSizeMb={DOCUMENT_RULES.maxBytes / BYTES_PER_MEGABYTE}
                maxFiles={DOCUMENT_RULES.maxFiles}
                disabledReason={type ? undefined : copy.chooseType}
                onFiles={receive}
                onReject={setRejected}
            />
            {rejected.map((message) => (
                <p key={message} role="alert" className="text-error text-xs">
                    {message}
                </p>
            ))}
            {rows.length > 0 ? (
                <ul className="flex flex-col">
                    {rows.map((row) => (
                        <FileRow
                            key={row.key}
                            name={row.file.name}
                            sizeBytes={row.file.size}
                            state={row.state === "failed" ? "failed" : "uploading"}
                            progress={upload.variables?.file === row.file ? upload.progress : 0}
                            message={row.message}
                            onRetry={row.state === "failed" ? () => void send([row]) : undefined}
                            onRemove={row.state === "failed" ? () => patch(row.key, null) : undefined}
                        />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
