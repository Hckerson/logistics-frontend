"use client";
import clsx from "clsx";
import { useAuthSignal } from "@/components/providers/auth-signal-provider";
import { HEADLINE_STAGGER } from "@/lib/home/constants";
import type { AccountSide } from "@/lib/types";

interface Props {
    title: readonly string[];
    lead: string;
    eyebrow?: string;
    sides?: readonly AccountSide[];
}

export default function AuthIntro({ title, lead, eyebrow, sides }: Props) {
    const { side } = useAuthSignal();
    const dimmed = (index: number) => Boolean(side && sides && sides[index] !== side);

    return (
        <header className="flex max-w-md flex-col gap-5">
            <h1 className="haulr-display text-text">
                {eyebrow ? (
                    <span className="mb-5 block overflow-hidden">
                        <span
                            className="haulr-rise haulr-label text-accent-dark block leading-normal font-normal"
                            style={{ animationDelay: "var(--haulr-auth-rise)" }}
                        >
                            {eyebrow}
                        </span>
                    </span>
                ) : null}
                {title.map((line, index) => (
                    <span key={line} className="block overflow-hidden pb-[0.08em]">
                        <span
                            className={clsx("haulr-rise block transition-colors duration-700", dimmed(index) && "text-text-muted/50")}
                            style={{ animationDelay: `calc(var(--haulr-auth-rise) + ${index * HEADLINE_STAGGER}s)` }}
                        >
                            {line}{" "}
                        </span>
                    </span>
                ))}
            </h1>
            <p className="text-text-secondary text-(length:--haulr-lead) text-pretty">{lead}</p>
        </header>
    );
}
