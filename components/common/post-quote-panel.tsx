import clsx from "clsx";
import MoneyBreakdown from "@/components/common/money-breakdown";
import Countdown from "@/components/ui/countdown";
import StatusLabel from "@/components/ui/status-label";
import type { LoadQuoteDto } from "@/lib/contract/schemas";
import { QUOTE_COPY } from "@/lib/data/loads/post-quote-copy";
import { TIME_MS } from "@/lib/constants";
import { heldTime, POSTING } from "@/lib/loads/posting";
import type { QuoteConfidence, SignalTone } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    quote: LoadQuoteDto;
    live: boolean;
    previousCents: number | null;
}

const TONES: Record<QuoteConfidence, SignalTone> = { high: "success", medium: "info", low: "warning" };

const SECONDS_PER_MINUTE = TIME_MS.minute / TIME_MS.second;

export const approvalText = ({ approval, validUntil, price }: LoadQuoteDto) => {
    const limit = approval.limitCents === null ? "" : formatMoney(approval.limitCents, price.currency);
    const time = heldTime(validUntil);
    return approval.approvers.length > 0
        ? fillTemplate(QUOTE_COPY.approval.body, { limit, approvers: approval.approvers.join(", "), time })
        : fillTemplate(QUOTE_COPY.approval.nobody, { limit });
};

export default function PostQuotePanel({ quote, live, previousCents }: Props) {
    const amount = formatMoney(quote.price.totalCents, quote.price.currency);

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="flex flex-col gap-2">
                    <p className="haulr-label text-text-muted">{QUOTE_COPY.price}</p>
                    <p className={clsx("text-h4 font-mono leading-none tracking-tight tabular-nums transition-colors", live ? "text-text" : "text-text-muted line-through")}>{amount}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <StatusLabel label={QUOTE_COPY.confidence[quote.confidence]} tone={TONES[quote.confidence]} />
                        <span className="text-text-secondary">{fillTemplate(QUOTE_COPY.miles, { miles: grouped(quote.miles) })}</span>
                        {previousCents !== null && previousCents !== quote.price.totalCents ? (
                            <span className="text-text-muted">{fillTemplate(QUOTE_COPY.previous, { amount: formatMoney(previousCents, quote.price.currency) })}</span>
                        ) : null}
                    </div>
                    <p className="text-text-muted text-xs">{QUOTE_COPY.confidenceDetail[quote.confidence]}</p>
                </div>
                <div className="border-border-dark flex flex-col gap-1 border px-3 py-2 md:min-w-44">
                    <p className="haulr-label text-text-muted">{QUOTE_COPY.held}</p>
                    <Countdown deadline={quote.validUntil} warnAt={POSTING.quoteWarnMinutes[0] * SECONDS_PER_MINUTE} label={QUOTE_COPY.held} className="text-h6" />
                    <p className="text-text-muted text-xs">{fillTemplate(QUOTE_COPY.heldUntil, { time: heldTime(quote.validUntil) })}</p>
                </div>
            </div>
            {live ? null : (
                <p role="status" className="border-signal-warning-edge bg-signal-warning-wash text-signal-warning border px-3 py-2 text-xs">
                    {QUOTE_COPY.expired}
                </p>
            )}
            {quote.approval.required ? (
                <div className="border-signal-warning-edge bg-signal-warning-wash flex flex-col gap-1 border px-3 py-2.5">
                    <p className="text-signal-warning text-sm font-medium">{QUOTE_COPY.approval.title}</p>
                    <p className="text-text-secondary text-xs text-pretty">{approvalText(quote)}</p>
                </div>
            ) : null}
            <MoneyBreakdown label={QUOTE_COPY.breakdown} money={quote.price} />
        </div>
    );
}
