"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Countdown from "@/components/ui/countdown";
import Panel from "@/components/ui/panel";
import RadioGroup from "@/components/ui/radio-group";
import type { ImportBatchDto, ImportPricingDto, ImportTenderDto } from "@/lib/contract/schemas";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_PRICE_COPY } from "@/lib/data/loads/import-price-copy";
import { useConfirmImportBatch, usePriceImportBatch } from "@/lib/hooks/use-import-actions";
import { CURRENCY } from "@/lib/loads/constants";
import { IMPORT_RULES, importFailureText } from "@/lib/loads/imports";
import { LABEL_TEXT } from "@/lib/ui/constants";
import type { ImportSplit } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    batch: ImportBatchDto;
    onEdit: () => void;
}

const copy = IMPORT_PRICE_COPY;
const SPLITS: readonly ImportSplit[] = ["postNow", "needsApproval", "draft"];
const TILE = "border-border flex flex-col gap-1 border p-3";

const detailOf = (split: ImportSplit, { spendLimitCents }: ImportPricingDto) => {
    if (split !== "needsApproval") return copy.split[split].detail;
    return spendLimitCents === null ? copy.noLimit : fillTemplate(copy.split.needsApproval.detail, { limit: formatMoney(spendLimitCents, CURRENCY) });
};

export default function ImportPricing({ batch, onEdit }: Props) {
    const price = usePriceImportBatch(batch.id);
    const confirm = useConfirmImportBatch(batch.id);
    const [strategy, setStrategy] = useState<ImportTenderDto["strategy"]>(batch.tender?.strategy ?? "openMarket");
    const [mode, setMode] = useState<ImportTenderDto["mode"]>(batch.tender?.mode ?? "bookNow");
    const [asking, setAsking] = useState(false);
    const [expired, setExpired] = useState(false);
    const failure = confirm.isError ? failureFrom(confirm.error) : price.isError ? failureFrom(price.error) : null;
    const problem = failure ? importFailureText(failure, { precondition: IMPORT_COPY.stale, conflict: copy.expired }) : undefined;
    const { pricing } = batch;
    if (!pricing) return null;

    const created = pricing.postNow + pricing.needsApproval + pricing.draft;
    const total = formatMoney(pricing.totalCents, CURRENCY);
    const counts = Object.fromEntries(SPLITS.map((split) => [split, pluralize(pricing[split], copy.loads)]));

    const submit = () =>
        confirm.mutate(
            { tender: { strategy, mode }, version: batch.version },
            {
                onSuccess: () => {
                    setAsking(false);
                    confirm.settle();
                },
            },
        );

    return (
        <Panel label={copy.label} aside={<span className="text-text-muted truncate text-xs">{batch.fileName}</span>}>
            <div className="flex flex-col gap-4">
                {pricing.unavailable ? (
                    <p role="status" className="border-signal-warning-edge bg-signal-warning-wash text-signal-warning border px-3 py-2 text-xs">
                        {copy.unavailable}
                    </p>
                ) : null}
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SPLITS.map((split) => (
                        <div key={split} className={TILE}>
                            <dt className={LABEL_TEXT}>{copy.split[split].label}</dt>
                            <dd className="text-text font-mono text-sm tabular-nums">{counts[split]}</dd>
                            <dd className="text-text-muted text-xs">{detailOf(split, pricing)}</dd>
                        </div>
                    ))}
                    <div className={TILE}>
                        <dt className={LABEL_TEXT}>{copy.total}</dt>
                        <dd className="text-text font-mono text-sm tabular-nums">{total}</dd>
                        <dd className="text-text-muted text-xs">{copy.totalNote}</dd>
                    </div>
                </dl>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    {expired ? (
                        <>
                            <p role="alert" className="text-error">
                                {copy.expired}
                            </p>
                            <Button tone="outline" size="sm" pending={price.isPending} pendingLabel={copy.repricing} onPress={() => price.mutate({ version: batch.version })}>
                                {copy.reprice}
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className={LABEL_TEXT}>{copy.quote}</span>
                            <Countdown deadline={pricing.quoteExpiresAt} warnAt={IMPORT_RULES.repriceWarnSeconds} format="words" onExpire={() => setExpired(true)} />
                        </>
                    )}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <RadioGroup legend={copy.tender.legend} options={copy.tender.options} value={strategy} onChange={setStrategy} />
                    <RadioGroup legend={copy.mode.legend} options={copy.mode.options} value={mode} onChange={setMode} />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button tone="outline" onPress={onEdit}>
                        {copy.edit}
                    </Button>
                    <Button disabledReason={expired ? copy.expired : created === 0 ? copy.nothing : undefined} onPress={() => setAsking(true)}>
                        {pluralize(created, copy.create)}
                    </Button>
                </div>
                {problem && !asking ? (
                    <p role="alert" className="text-error text-xs">
                        {problem}
                    </p>
                ) : null}
            </div>
            <ConfirmDialog
                isOpen={asking}
                onOpenChange={setAsking}
                title={copy.confirm.title}
                consequence={fillTemplate(copy.confirm.consequence, { ...counts, total })}
                confirmLabel={copy.confirm.label}
                cancelLabel={copy.confirm.cancel}
                onConfirm={submit}
                pending={confirm.isPending}
                error={problem}
            />
        </Panel>
    );
}
