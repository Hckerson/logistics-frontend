"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import Select from "@/components/ui/select";
import Switch from "@/components/ui/switch";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { useMapImport } from "@/lib/hooks/use-import-actions";
import { IMPORT_FIELDS, IMPORT_REQUIRED, importFailureText } from "@/lib/loads/imports";
import type { ChoiceOption, ImportField } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    batch: ImportBatchDto;
}

type Choice = ImportField | "ignore";

const { mapping: copy } = IMPORT_COPY;
const IGNORE = "ignore";

export default function ImportMapping({ batch }: Props) {
    const map = useMapImport(batch.id);
    const [chosen, setChosen] = useState<readonly (ImportField | null)[]>(() => batch.columns.map((column) => column.field));
    const [save, setSave] = useState(true);
    const missing = IMPORT_REQUIRED.filter((field) => !chosen.includes(field));
    const failure = map.isError ? failureFrom(map.error) : null;

    const choose = (index: number) => (value: Choice) =>
        setChosen((current) => current.map((field, at) => (at === index ? (value === IGNORE ? null : value) : field)));

    const optionsFor = (index: number): ChoiceOption<Choice>[] => [
        { value: IGNORE, label: copy.ignore },
        ...IMPORT_FIELDS.map((field) => {
            const owner = chosen.findIndex((taken, at) => taken === field && at !== index);
            return {
                value: field,
                label: IMPORT_FIELD_SPECS[field].label,
                disabledReason: owner === -1 ? undefined : fillTemplate(copy.taken, { header: batch.columns[owner].header }),
            };
        }),
    ];

    const submit = () =>
        map.mutate({ columns: batch.columns.map((column, index) => ({ index: column.index, field: chosen[index] ?? null })), save, version: batch.version });

    return (
        <Panel label={copy.label} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col gap-3">
                <p className="text-text-secondary text-xs">{copy.lead}</p>
                <ul className="border-border flex flex-col border-y">
                    {batch.columns.map((column, index) => {
                        const kept = chosen[index] === column.field && column.field !== null;
                        return (
                            <li key={column.index} className="border-border-light grid gap-2 border-b py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
                                <div className="flex min-w-0 flex-col gap-0.5 text-xs">
                                    <span className="text-text truncate">
                                        {column.header}
                                        {kept ? <span className="text-text-muted"> · {copy.source[column.source]}</span> : null}
                                    </span>
                                    <span className="text-text-muted truncate">{column.samples.length > 0 ? fillTemplate(copy.samples, { samples: column.samples.join(", ") }) : copy.empty}</span>
                                </div>
                                <Select size="sm" label={fillTemplate(copy.column, { header: column.header })} options={optionsFor(index)} value={chosen[index] ?? IGNORE} onChange={choose(index)} />
                            </li>
                        );
                    })}
                </ul>
                {missing.length > 0 ? (
                    <div role="status" className="text-signal-warning flex flex-col gap-1 text-xs">
                        <p>{pluralize(missing.length, copy.missing)}</p>
                        <p className="text-text-secondary">{missing.map((field) => IMPORT_FIELD_SPECS[field].label).join(", ")}</p>
                    </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Switch label={copy.save} isSelected={save} onChange={setSave} size="sm" />
                    <Button pending={map.isPending} pendingLabel={copy.pending} disabledReason={missing.length > 0 ? copy.blocked : undefined} onPress={submit}>
                        {copy.submit}
                    </Button>
                </div>
                {failure ? (
                    <p role="alert" className="text-error text-xs">
                        {importFailureText(failure, { precondition: IMPORT_COPY.stale, validation: copy.blocked })}
                    </p>
                ) : null}
            </div>
        </Panel>
    );
}
