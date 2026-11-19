"use client";
import { ArrowRight, Download } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import Panel from "@/components/ui/panel";
import { appRoutes } from "@/lib/app-routes";
import type { ImportBatchDto, ImportOutcomeDto } from "@/lib/contract/schemas";
import { IMPORT_PRICE_COPY } from "@/lib/data/loads/import-price-copy";
import { useImportDownload } from "@/lib/hooks/use-bulk-import";
import { IMPORT_PARAM, importFailureText } from "@/lib/loads/imports";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    batch: ImportBatchDto;
}

const { result: copy } = IMPORT_PRICE_COPY;
const OUTCOMES: readonly (keyof ImportOutcomeDto)[] = ["posted", "pendingApproval", "draft", "rejected"];

export default function ImportResult({ batch }: Props) {
    const download = useImportDownload();
    const failure = download.isError ? failureFrom(download.error) : null;

    return (
        <Panel label={copy.label} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col gap-4">
                <p className="text-text-secondary text-xs">{fillTemplate(copy.lead, { file: batch.fileName })}</p>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {OUTCOMES.map((outcome) => (
                        <div key={outcome} className="border-border flex flex-col gap-1 border p-3">
                            <dt className={LABEL_TEXT}>{copy.outcomes[outcome]}</dt>
                            <dd className="text-text font-mono text-sm tabular-nums">{batch.outcome?.[outcome] ?? 0}</dd>
                        </div>
                    ))}
                </dl>
                <div className="flex flex-wrap items-center gap-2">
                    <Button icon={Download} pending={download.isPending} onPress={() => download.mutate(batch.id, { onSuccess: ({ url }) => window.location.assign(url) })}>
                        {copy.download}
                    </Button>
                    <ButtonLink tone="outline" trailing={ArrowRight} href={`${appRoutes.shipments()}${queryString({ [IMPORT_PARAM]: batch.id })}`}>
                        {copy.loads}
                    </ButtonLink>
                </div>
                {failure ? (
                    <p role="alert" className="text-error text-xs">
                        {importFailureText(failure)}
                    </p>
                ) : null}
            </div>
        </Panel>
    );
}
