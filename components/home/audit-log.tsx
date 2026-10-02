"use client";
import { motion } from "motion/react";
import { REVEAL_EASE } from "@/lib/home/constants";
import { AUDIT_LOG, ENTERPRISE_COPY } from "@/lib/data/home/enterprise";

const STAGGER = 0.16;
const SECONDS = 0.7;

export default function AuditLog() {
    return (
        <div
            role="img"
            aria-label={ENTERPRISE_COPY.log.summary}
            className="border-border-dark bg-background flex h-full flex-col rounded-md border"
        >
            <div aria-hidden className="flex h-full flex-col">
                <p className="haulr-label text-text-muted border-border border-b px-5 py-3">
                    {ENTERPRISE_COPY.log.label}
                </p>
                <ol className="flex flex-1 flex-col justify-center gap-4 p-5 font-mono text-xs sm:text-sm">
                    {AUDIT_LOG.map((entry, index) => (
                        <motion.li
                            key={entry.id}
                            className="flex items-baseline gap-4"
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: SECONDS, delay: index * STAGGER, ease: REVEAL_EASE }}
                        >
                            <span className="text-accent tabular-nums">{entry.value}</span>
                            <span className="text-text-secondary">{entry.label}</span>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
