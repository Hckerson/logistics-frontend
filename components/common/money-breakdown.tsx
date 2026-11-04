import clsx from "clsx";
import Panel from "@/components/ui/panel";
import StatusLabel from "@/components/ui/status-label";
import type { MoneyDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SUBTRACTIVE_CHARGES } from "@/lib/loads/constants";
import { formatMoney } from "@/lib/utils/currency";

interface Props {
    label: string;
    money: MoneyDto;
}

const { money: copy } = LOAD_COPY;
const PART_STATES = { pendingApproval: copy.pending, disputed: copy.disputed } as const;

export default function MoneyBreakdown({ label, money }: Props) {
    const amount = (cents: number) => formatMoney(cents, money.currency);

    return (
        <Panel label={label} aside={money.pending ? <StatusLabel label={copy.pending} tone="warning" /> : null}>
            <div className="flex items-baseline justify-between gap-3">
                <p className="haulr-label text-text-muted">{copy.total}</p>
                <p className="text-text text-h6 font-mono tabular-nums">{amount(money.totalCents)}</p>
            </div>
            <dl className="flex flex-col text-xs">
                {money.parts.map((part, index) => (
                    <div key={`${part.kind}-${index}`} className="border-border flex items-baseline justify-between gap-3 border-t py-2 last:pb-0">
                        <dt className="text-text-secondary">
                            {copy.kinds[part.kind]}
                            {part.status === "agreed" ? null : <span className="text-signal-warning"> · {PART_STATES[part.status]}</span>}
                        </dt>
                        <dd className={clsx("font-mono tabular-nums", part.status === "agreed" ? "text-text" : "text-text-muted")}>
                            {SUBTRACTIVE_CHARGES.includes(part.kind) ? "−" : ""}
                            {amount(part.amountCents)}
                        </dd>
                    </div>
                ))}
            </dl>
            {money.pending ? <p className="text-text-muted text-xs">{copy.pendingNote}</p> : null}
        </Panel>
    );
}
