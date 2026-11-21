import { format, parseISO } from "date-fns";
import { NETWORK_COPY } from "@/lib/data/home/network";
import { NETWORK_STATS } from "@/lib/home/constants";
import { readNetworkStats } from "@/lib/home/network-stats";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped, share } from "@/lib/utils/format-number";

const { figures } = NETWORK_COPY;

export default async function NetworkProof() {
    const stats = await readNetworkStats();
    if (!stats) return null;

    const rows = [
        { id: "carriers", value: grouped(stats.approvedCarriers), label: figures.carriers },
        { id: "delivered", value: grouped(stats.loadsDelivered), label: figures.delivered },
        { id: "on-time", value: share(stats.onTimeRate), label: figures.onTime },
    ];
    const period = fillTemplate(NETWORK_COPY.period, {
        from: format(parseISO(stats.periodStart), NETWORK_STATS.day),
        to: format(parseISO(stats.periodEnd), NETWORK_STATS.day),
        time: format(parseISO(stats.computedAt), NETWORK_STATS.time),
    });

    return (
        <section aria-labelledby="network-title" className="haulr-section">
            <div className="haulr-shell flex flex-col gap-10">
                <header className="flex flex-col gap-5">
                    <p className="haulr-label text-accent">{NETWORK_COPY.label}</p>
                    <h2 id="network-title" className="haulr-title text-text max-w-2xl">
                        {NETWORK_COPY.title}
                    </h2>
                </header>
                <dl className="border-border grid border-t sm:grid-cols-3">
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className="border-border flex flex-col-reverse gap-2 border-b py-6 sm:border-r sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:border-r-0"
                        >
                            <dt className="text-text-secondary">{row.label}</dt>
                            <dd className="haulr-title text-text tabular-nums">{row.value}</dd>
                        </div>
                    ))}
                </dl>
                <p className="haulr-label text-text-muted">
                    {NETWORK_COPY.note} · {period}
                </p>
            </div>
        </section>
    );
}
