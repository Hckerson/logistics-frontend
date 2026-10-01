import clsx from "clsx";
import LaneRule from "@/components/home/lane-rule";
import { LANES_COPY } from "@/lib/data/home/lanes";
import type { LaneSample } from "@/lib/types";

interface Props {
    lane: LaneSample;
    featured: boolean;
}

const FACTS = ["rate", "transit", "onTime"] as const;

export default function LaneCard({ lane, featured }: Props) {
    return (
        <li
            className={clsx(
                "flex shrink-0 flex-col gap-6 rounded-sm border p-6",
                featured
                    ? "border-text bg-text text-text-inverse w-80 sm:w-[28rem]"
                    : "border-border-dark bg-background text-text w-72 sm:w-80",
            )}
        >
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <p className="text-3xl font-normal tracking-tight" style={{ fontStretch: "var(--haulr-semi)" }}>
                    {lane.from} <span className="text-accent">→</span> {lane.to}
                </p>
                <p className={clsx("haulr-label", featured ? "text-text-inverse/60" : "text-text-muted")}>
                    {lane.equipment}
                </p>
            </div>
            <LaneRule className="w-full" />
            <dl className="grid grid-cols-3 gap-4">
                {FACTS.map((fact) => (
                    <div key={fact} className="flex flex-col-reverse gap-1">
                        <dt className={clsx("text-xs", featured ? "text-text-inverse/60" : "text-text-muted")}>
                            {LANES_COPY.columns[fact]}
                        </dt>
                        <dd className="font-mono text-lg tabular-nums">{lane[fact]}</dd>
                    </div>
                ))}
            </dl>
        </li>
    );
}
