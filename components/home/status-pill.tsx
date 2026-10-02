import clsx from "clsx";
import type { ConsoleLoad } from "@/lib/types";

interface Props {
    tone: ConsoleLoad["tone"];
    children: string;
}

const tones: Record<ConsoleLoad["tone"], string> = {
    live: "border-accent/40 text-accent",
    done: "border-success/40 text-success",
    idle: "border-border-dark text-text-muted",
};

const dots: Record<ConsoleLoad["tone"], string> = {
    live: "bg-accent animate-pulse",
    done: "bg-success",
    idle: "bg-text-muted",
};

export default function StatusPill({ tone, children }: Props) {
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap",
                tones[tone],
            )}
        >
            <span className={clsx("block size-1.5 rounded-full", dots[tone])} />
            {children}
        </span>
    );
}
