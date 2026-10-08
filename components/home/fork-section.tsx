"use client";
import { useRef } from "react";
import { useInView } from "motion/react";
import DoorCard from "@/components/home/door-card";
import ForkLane from "@/components/home/fork-lane";
import { useSide } from "@/lib/hooks/use-side";
import { DOORS, FORK_COPY } from "@/lib/data/home/fork";
import { REVEAL_VIEWPORT } from "@/lib/home/constants";

export default function ForkSection() {
    const { side } = useSide();
    const gridRef = useRef<HTMLDivElement>(null);
    const shown = useInView(gridRef, REVEAL_VIEWPORT);

    return (
        <section aria-labelledby="fork-title" className="haulr-section">
            <div className="haulr-shell flex flex-col gap-12 lg:gap-10">
                <header className="flex max-w-3xl flex-col gap-5">
                    <p className="haulr-label text-accent">{FORK_COPY.label}</p>
                    <h2 id="fork-title" className="haulr-title text-text">
                        {FORK_COPY.title}
                    </h2>
                </header>
                <div className="flex flex-col gap-6">
                    <ForkLane side={side} />
                    <div ref={gridRef} className="grid gap-12 lg:grid-cols-12 lg:gap-6">
                        {DOORS.map((door, index) => (
                            <DoorCard key={door.side} door={door} active={door.side === side} order={index} shown={shown} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
