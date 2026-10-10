import { SUPPORT_COPY } from "@/lib/data/support/copy";
import type { ContextLine } from "@/lib/types";

interface Props {
    lines: readonly ContextLine[];
}

export default function TicketContext({ lines }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <p className="haulr-label text-text-muted">{SUPPORT_COPY.context.label}</p>
            <dl className="bg-background-muted/40 border-border flex flex-col gap-1.5 border-l-2 px-3 py-2.5">
                {lines.map((line) => (
                    <div key={line.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs">
                        <dt className="text-text-muted">{line.label}</dt>
                        <dd className="text-text font-mono break-all">{line.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
