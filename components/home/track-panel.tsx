"use client";
import { motion, type MotionValue } from "motion/react";
import PanelFrame from "@/components/home/panel-frame";
import { TRACK_PANEL as PANEL } from "@/lib/data/home/panels";
import { useTruckReadouts } from "@/lib/hooks/use-truck-readouts";

interface Props {
    progress: MotionValue<number>;
}

export default function TrackPanel({ progress }: Props) {
    const { travelled, eta: confidence, remaining } = useTruckReadouts(progress);

    return (
        <PanelFrame label={PANEL.label} status={PANEL.status} summary={PANEL.summary}>
            <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-text-muted text-sm">{PANEL.eta.label}</p>
                    <p className="text-text font-mono text-4xl tracking-tight tabular-nums">{PANEL.eta.value}</p>
                </div>
                <motion.p className="text-accent pb-1 font-mono text-lg tabular-nums">{confidence}</motion.p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="bg-background-muted h-1.5 overflow-hidden rounded-full">
                    <motion.span style={{ scaleX: travelled }} className="bg-accent block h-full origin-left" />
                </div>
                <div className="text-text-muted flex justify-between font-mono text-xs">
                    <span>{PANEL.remaining.label}</span>
                    <motion.span className="tabular-nums">{remaining}</motion.span>
                </div>
            </div>
            <ol className="border-border flex flex-col gap-4 border-t pt-5">
                {PANEL.stops.map((stop, index) => (
                    <li key={stop.id} className="flex gap-3">
                        <span
                            className={
                                index === 0
                                    ? "bg-accent mt-1.5 size-2 shrink-0 rounded-full"
                                    : "border-accent mt-1.5 size-2 shrink-0 rounded-full border"
                            }
                        />
                        <span className="flex flex-col">
                            <span className="text-text text-sm">{stop.label}</span>
                            <span className="text-text-muted text-sm">{stop.value}</span>
                        </span>
                    </li>
                ))}
            </ol>
            <div className="border-border flex flex-col gap-1 border-t pt-4">
                <p className="text-text font-mono text-xs">{PANEL.source}</p>
                <p className="text-text-muted text-xs">{PANEL.shared}</p>
            </div>
        </PanelFrame>
    );
}
