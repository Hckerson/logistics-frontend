import clsx from "clsx";
import LaneRule from "@/components/home/lane-rule";
import StatusPill from "@/components/home/status-pill";
import { CONSOLE_COLUMNS, CONSOLE_DETAIL, CONSOLE_LOADS, PRODUCTS_COPY } from "@/lib/data/home/products";

const GRID = "grid grid-cols-[1.1fr_1.1fr_1fr] items-center gap-4 px-5 sm:grid-cols-[1fr_1fr_1.1fr_1.6fr_0.7fr]";

export default function ShipperConsole() {
    return (
        <div
            role="img"
            aria-label={PRODUCTS_COPY.console.summary}
            className="border-border-dark bg-background overflow-hidden rounded-md border shadow-2xl"
        >
            <div aria-hidden className="flex flex-col">
                <div className="border-border flex items-center justify-between border-b px-5 py-3">
                    <p className="haulr-label text-text-muted">{PRODUCTS_COPY.console.label}</p>
                    <p className="haulr-label text-text-muted">{PRODUCTS_COPY.note}</p>
                </div>
                <div className={clsx(GRID, "haulr-label text-text-muted border-border border-b py-3")}>
                    <span>{CONSOLE_COLUMNS.load}</span>
                    <span>{CONSOLE_COLUMNS.lane}</span>
                    <span>{CONSOLE_COLUMNS.status}</span>
                    <span className="hidden sm:block">{CONSOLE_COLUMNS.eta}</span>
                    <span className="hidden text-right sm:block">{CONSOLE_COLUMNS.rate}</span>
                </div>
                {CONSOLE_LOADS.map((load, index) => (
                    <div
                        key={load.id}
                        className={clsx(
                            GRID,
                            "border-border border-b py-3.5 text-sm",
                            index === 0 && "bg-background-muted shadow-[inset_2px_0_0_var(--colors-accent)]",
                        )}
                    >
                        <span className="text-text font-mono">{load.id}</span>
                        <span className="text-text">{load.lane}</span>
                        <span>
                            <StatusPill tone={load.tone}>{load.status}</StatusPill>
                        </span>
                        <span className="text-text-secondary hidden font-mono text-xs sm:block">{load.eta}</span>
                        <span className="text-text hidden text-right font-mono sm:block">{load.rate}</span>
                    </div>
                ))}
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-text text-lg">{CONSOLE_DETAIL.title}</p>
                        <p className="text-text-muted text-sm">{CONSOLE_DETAIL.carrier}</p>
                    </div>
                    <LaneRule still className="w-full" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-text-secondary font-mono text-xs">{CONSOLE_DETAIL.source}</p>
                        <ul className="flex gap-2">
                            {CONSOLE_DETAIL.documents.map((document) => (
                                <li
                                    key={document}
                                    className="border-border-dark text-text-secondary rounded-sm border px-2.5 py-1 text-xs"
                                >
                                    {document}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
