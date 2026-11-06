"use client";
import Link from "next/link";
import LaneLabel from "@/components/common/lane-label";
import CopyButton from "@/components/ui/copy-button";
import StatusLabel from "@/components/ui/status-label";
import { QUIET_LINK } from "@/lib/auth/constants";
import { DASHBOARD_ROUTE } from "@/lib/constants";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoad } from "@/lib/hooks/use-loads";
import { loadStatusDisplay } from "@/lib/loads/status";
import { awaitingOf, loadFacts, placeName } from "@/lib/loads/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadDto;
}

const { trail, header } = LOAD_COPY;

export default function LoadHeader({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const parties = [
        { id: "shipper", label: header.shipper, value: load.shipper.name },
        { id: "carrier", label: header.carrier, value: load.carrier?.name ?? header.unbooked },
        { id: "po", label: header.po, value: load.poNumber },
        { id: "bol", label: header.bol, value: load.bolNumber },
    ];

    return (
        <header className="flex flex-col gap-3">
            <nav aria-label={trail.label}>
                <ol className="text-text-muted flex items-center gap-2 text-xs">
                    <li>
                        <Link href={DASHBOARD_ROUTE} className={QUIET_LINK}>
                            {trail.root}
                        </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li aria-current="page" className="text-text font-mono">
                        {load.id}
                    </li>
                </ol>
            </nav>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-text text-h5 font-mono tracking-tight">{load.id}</h1>
                <CopyButton value={load.id} label={header.copy} done={fillTemplate(header.copied, { reference: load.id })} />
                <StatusLabel {...loadStatusDisplay(load.status, load.eta?.late ? "late" : undefined)} />
            </div>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <LaneLabel origin={placeName(load.stops[0])} destination={placeName(load.stops[load.stops.length - 1])} />
                {loadFacts(load).map((fact) => (
                    <span key={fact} className="text-text-secondary">
                        <span aria-hidden className="text-text-muted">
                            ·{" "}
                        </span>
                        {fact}
                    </span>
                ))}
            </p>
            <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                {parties.map(({ id, label, value }) =>
                    value ? (
                        <div key={id} className="flex gap-1.5">
                            <dt className="text-text-muted">{label}</dt>
                            <dd className="text-text">{value}</dd>
                        </div>
                    ) : null,
                )}
            </dl>
            <p className="text-text-secondary flex items-center gap-2 text-xs">
                <span aria-hidden className="bg-accent size-1.5 shrink-0 rounded-full" />
                {awaitingOf(load)}
            </p>
        </header>
    );
}
