"use client";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import ImportRowFields from "@/components/common/import-row-fields";
import Button from "@/components/ui/button";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { appRoutes } from "@/lib/app-routes";
import type { ImportRowDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_REVIEW_COPY } from "@/lib/data/loads/import-review-copy";
import { useFacilities } from "@/lib/hooks/use-bulk-import";
import { useUpdateImportRow } from "@/lib/hooks/use-import-actions";
import { importFailureText } from "@/lib/loads/imports";
import { LABEL_TEXT, RECORD_LINK } from "@/lib/ui/constants";
import type { ImportField } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    batchId: string;
    row: ImportRowDto;
    onNext: () => void;
    onClose: () => void;
}

const { editor: copy, outcomes } = IMPORT_REVIEW_COPY;

export default function ImportRowEditor({ batchId, row, onNext, onClose }: Props) {
    const [values, setValues] = useState(row.values);
    const update = useUpdateImportRow(batchId);
    const facilities = useFacilities();
    const announce = useAnnounce();
    const failure = update.isError ? failureFrom(update.error) : null;

    const change = (field: ImportField, value: string) => setValues((current) => ({ ...current, [field]: value }));

    const save = (next: boolean) =>
        update.mutate(
            { rowId: row.id, input: { values, version: row.version } },
            {
                onSuccess: (saved) => {
                    const outcome = outcomes[saved.excluded ? "excluded" : saved.outcome].label;
                    announce({ message: fillTemplate(copy.saved, { line: String(saved.line), outcome }) });
                    if (next) onNext();
                },
            },
        );

    return (
        <form
            aria-label={fillTemplate(copy.label, { line: String(row.line) })}
            className="flex flex-col gap-3"
            onSubmit={(event) => {
                event.preventDefault();
                save(true);
            }}
        >
            {row.issues.length > 0 ? (
                <div className="flex flex-col gap-1">
                    <p className={LABEL_TEXT}>{copy.problems}</p>
                    <ul className="flex flex-col gap-0.5 text-xs">
                        {row.issues.map((found) => (
                            <li key={`${found.code}-${found.field ?? "row"}`} className={clsx(found.severity === "error" ? "text-error" : "text-signal-warning")}>
                                {found.message}
                                {found.loadId ? (
                                    <>
                                        {" "}
                                        <Link href={appRoutes.load(found.loadId)} className={RECORD_LINK}>
                                            {fillTemplate(copy.openLoad, { load: found.loadId })}
                                        </Link>
                                    </>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
            <ImportRowFields values={values} issues={row.issues} facilities={facilities.data ?? []} onChange={change} />
            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm" pending={update.isPending} pendingLabel={copy.saving}>
                    {copy.saveNext}
                </Button>
                <Button tone="outline" size="sm" isDisabled={update.isPending} onPress={() => save(false)}>
                    {copy.save}
                </Button>
                <Button tone="ghost" size="sm" onPress={onClose}>
                    {copy.close}
                </Button>
            </div>
            {failure ? (
                <p role="alert" className="text-error text-xs">
                    {importFailureText(failure, { precondition: IMPORT_COPY.stale, conflict: IMPORT_COPY.stale })}
                </p>
            ) : null}
        </form>
    );
}
