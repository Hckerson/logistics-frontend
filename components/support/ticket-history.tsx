"use client";
import Link from "next/link";
import { useState } from "react";
import SectionState from "@/components/common/section-state";
import SegmentedControl from "@/components/ui/segmented-control";
import StatusLabel from "@/components/ui/status-label";
import { QUIET_LINK } from "@/lib/auth/constants";
import { SUPPORT_ROUTE, loginRoute } from "@/lib/constants";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { useTickets } from "@/lib/hooks/use-tickets";
import { TICKET_STATUSES } from "@/lib/enums/ticket-status";
import { TICKET_STATUS_TONES } from "@/lib/support/constants";
import type { TicketStatus } from "@/lib/types";
import { dateFormatter } from "@/lib/utils/date-formatter";

interface Props {
    signedIn: boolean;
}

type Filter = TicketStatus | "all";

const { history } = SUPPORT_COPY;
const FILTERS = (["all", ...TICKET_STATUSES] satisfies Filter[]).map((value) => ({ value, label: history.filters[value] }));

export default function TicketHistory({ signedIn }: Props) {
    const [filter, setFilter] = useState<Filter>("all");
    const tickets = useTickets(filter === "all" ? undefined : filter, signedIn);

    if (!signedIn) {
        return (
            <div className="flex flex-col gap-2">
                <p className="haulr-label text-text-muted">{history.label}</p>
                <p className="text-text-secondary text-xs">{history.signedOut}</p>
                <Link href={loginRoute(SUPPORT_ROUTE)} className={QUIET_LINK}>
                    {history.signIn}
                </Link>
            </div>
        );
    }

    return (
        <section aria-labelledby="ticket-history" className="flex flex-col gap-3">
            <h2 id="ticket-history" className="haulr-label text-text-muted">
                {history.label}
            </h2>
            <SegmentedControl label={history.filterLabel} options={FILTERS} value={filter} onChange={setFilter} size="sm" className="self-start" />
            <SectionState
                label={history.part}
                query={tickets}
                isEmpty={(list) => list.length === 0}
                empty={<p className="text-text-muted text-xs">{history.empty}</p>}
            >
                {(list) => (
                    <ul className="border-border border-t">
                        {list.map((ticket) => (
                            <li key={ticket.reference} className="border-border flex flex-col gap-1 border-b py-2.5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-text font-mono text-xs">{ticket.reference}</span>
                                    <StatusLabel label={history.filters[ticket.status]} tone={TICKET_STATUS_TONES[ticket.status]} />
                                </div>
                                <p className="text-text-secondary text-xs">{ticket.subject}</p>
                                <p className="text-text-muted text-xs">{dateFormatter(ticket.updated, history.dateFormat)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionState>
        </section>
    );
}
