"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { Camera, CheckmarkFilled, RadioButton } from "@carbon/icons-react";
import { DRIVER_VIEW, PRODUCTS_COPY } from "@/lib/data/home/products";
import { ARRIVE } from "@/lib/home/constants";
import type { RecordBeat } from "@/lib/types";

interface Props {
    beat: RecordBeat;
}

export default function DriverPhone({ beat }: Props) {
    const delivered = beat.done >= DRIVER_VIEW.steps.length;

    return (
        <div
            role="img"
            aria-label={PRODUCTS_COPY.phone.summary}
            className="border-border-dark bg-background-muted mx-auto w-full max-w-xs rounded-[2rem] border p-3 shadow-2xl"
        >
            <div aria-hidden className="border-border bg-background flex flex-col gap-5 rounded-[1.4rem] border p-5">
                <div className="flex items-center justify-between">
                    <p className="haulr-label text-text-muted">{PRODUCTS_COPY.phone.label}</p>
                    <span className="bg-accent block size-1.5 animate-pulse rounded-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-accent text-sm">{DRIVER_VIEW.stop}</p>
                    <p className="text-text text-3xl tracking-tight">{DRIVER_VIEW.place}</p>
                    <p className="text-text-muted text-sm">{DRIVER_VIEW.window}</p>
                </div>
                <ul className="flex flex-col gap-3">
                    {DRIVER_VIEW.steps.map((step, index) => {
                        const done = index < beat.done;
                        return (
                            <li key={step.id} className="flex items-start gap-3 text-sm">
                                {done ? (
                                    <CheckmarkFilled className="text-success mt-0.5 size-4 shrink-0" />
                                ) : (
                                    <RadioButton className="text-accent mt-0.5 size-4 shrink-0" />
                                )}
                                <span className={clsx("transition-colors duration-500", done ? "text-text-muted" : "text-text")}>
                                    {step.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>
                <div
                    className={clsx(
                        "flex h-24 flex-col items-center justify-center gap-2 rounded-md border transition-colors duration-500",
                        delivered ? "border-success/50 text-success border-solid" : "border-accent/50 text-accent border-dashed",
                    )}
                >
                    {delivered ? <CheckmarkFilled className="size-5" /> : <Camera className="size-5" />}
                    <motion.p key={beat.pod} {...ARRIVE} className="text-sm">
                        {beat.pod}
                    </motion.p>
                </div>
                <p
                    className={clsx(
                        "flex h-12 items-center justify-center rounded-md font-medium transition-colors duration-500",
                        delivered ? "bg-background-muted text-text-secondary" : "bg-accent text-text-inverse",
                    )}
                >
                    <motion.span key={beat.action} {...ARRIVE}>
                        {beat.action}
                    </motion.span>
                </p>
                <p className="text-text-secondary text-center font-mono text-xs">{DRIVER_VIEW.pay}</p>
            </div>
        </div>
    );
}
