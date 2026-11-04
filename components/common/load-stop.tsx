import clsx from "clsx";
import type { StopDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { arrivedLate, stopMoment, stopWindow } from "@/lib/loads/view";

interface Props {
    stop: StopDto;
    current: boolean;
    last: boolean;
}

const { stops: copy } = LOAD_COPY;

const DOT = {
    done: "bg-accent",
    current: "border-accent bg-background border shadow-[0_0_0_3px_var(--haulr-glow)]",
    ahead: "border-border-dark bg-background border",
} as const;

export default function LoadStop({ stop, current, last }: Props) {
    const { facility } = stop;
    const momentOf = (iso: string | null) => (iso ? stopMoment(iso, facility.timeZone) : null);
    const rows = [
        { id: "window", label: copy.window, value: stopWindow(stop) },
        { id: "arrived", label: copy.arrived, value: momentOf(stop.arrivedAt) },
        { id: "departed", label: copy.departed, value: momentOf(stop.departedAt) },
    ];

    return (
        <li className="flex gap-3">
            <span aria-hidden className="relative flex w-2 shrink-0 justify-center pt-1">
                <span className={clsx("relative z-10 size-2 rounded-full", DOT[stop.departedAt ? "done" : current ? "current" : "ahead"])} />
                {last ? null : <span className={clsx("absolute top-3 -bottom-1 w-px", stop.departedAt ? "bg-accent/60" : "bg-border-dark")} />}
            </span>
            <div className={clsx("flex min-w-0 flex-1 flex-col gap-2", !last && "pb-5")}>
                <div className="flex items-baseline justify-between gap-2">
                    <p className="haulr-label text-text">
                        {copy.types[stop.type]} · {stop.sequence}
                    </p>
                    {stop.reference ? (
                        <p className="text-text-muted font-mono text-xs">
                            {copy.reference} {stop.reference}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-col text-xs">
                    <p className="text-text">{facility.name}</p>
                    <p className="text-text-muted">
                        {facility.line1}, {facility.city}, {facility.region} {facility.postalCode}
                    </p>
                </div>
                <dl className="flex flex-col gap-1 text-xs">
                    {rows.map(({ id, label, value }) => (
                        <div key={id} className="flex flex-wrap justify-between gap-x-3">
                            <dt className="text-text-muted">{label}</dt>
                            <dd className={clsx("font-mono", value ? "text-text" : "text-text-muted")}>{value ?? copy.notYet}</dd>
                        </div>
                    ))}
                </dl>
                {arrivedLate(stop) ? <p className="text-signal-warning text-xs">{copy.late}</p> : null}
                {stop.instructions ? <p className="text-text-secondary border-border-dark border-l-2 pl-2 text-xs">{stop.instructions}</p> : null}
            </div>
        </li>
    );
}
