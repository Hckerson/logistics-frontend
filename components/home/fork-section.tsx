"use client";
import { useRef } from "react";
import { useInView } from "motion/react";
import DoorCard from "@/components/home/door-card";
import ForkLane from "@/components/home/fork-lane";
import { useSide } from "@/lib/hooks/use-side";
import { DOORS, FORK_COPY } from "@/lib/data/home/fork";

export default function ForkSection() {
    const { side } = useSide();
    const gridRef = useRef<HTMLDivElement>(null);
    const shown = useInView(gridRef, { once: true, margin: "-15%" });

    return (
        <section aria-labelledby="fork-title" className="haulr-section">
            <div className="haulr-shell flex flex-col">
                <header className="flex flex-col items-center gap-5 text-center">
                    <p className="haulr-label text-accent-dark">{FORK_COPY.label}</p>
                    <h2 id="fork-title" className="haulr-title text-text max-w-3xl">
                        {FORK_COPY.title}
                    </h2>
                </header>
                <ForkLane side={side} />
                <div ref={gridRef} className="mt-10 grid gap-6 lg:mt-0 lg:grid-cols-12">
                    {DOORS.map((door, index) => (
                        <DoorCard key={door.side} door={door} active={door.side === side} order={index} shown={shown} />
                    ))}
                </div>
            </div>
        </section>
    );
}
