"use client";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import SectionState from "@/components/common/section-state";
import { QUIET_LINK } from "@/lib/auth/constants";
import { SUPPORT_ROUTE, loginRoute } from "@/lib/constants";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { useTickets } from "@/lib/hooks/use-tickets";
import { TICKET_STATUSES } from "@/lib/enums/ticket-status";
import type { TicketStatus } from "@/lib/types";
import { dateFormatter } from "@/lib/utils/date-formatter";

interface Props {
    signedIn: boolean;
}

type Filter = TicketStatus | "all";

const FILTERS: readonly Filter[] = ["all", ...TICKET_STATUSES];
const TONE: Record<TicketStatus, string> = { open: "text-text-secondary", waiting: "text-accent", resolved: "text-text-muted" };
const { history } = SUPPORT_COPY;

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
            <div className="flex flex-wrap gap-1">
                {FILTERS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        aria-pressed={filter === option}
                        onClick={() => setFilter(option)}
                        className={clsx(
                            "haulr-label focus-visible:outline-text cursor-pointer border px-2 py-1 transition-colors focus-visible:outline-2",
                            filter === option ? "border-accent text-accent" : "border-border text-text-muted hover:text-text",
                        )}
                    >
                        {history.filters[option]}
                    </button>
                ))}
            </div>
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
                                    <span className={clsx("haulr-label", TONE[ticket.status])}>{history.filters[ticket.status]}</span>
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
