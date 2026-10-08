"use client";
import { useRef } from "react";
import clsx from "clsx";
import { useInView } from "motion/react";
import LaneRow, { LANE_ROW_GRID } from "@/components/home/lane-row";
import { LANES_COPY, LANE_SAMPLES } from "@/lib/data/home/lanes";
import { REVEAL_VIEWPORT } from "@/lib/home/constants";
import { useReduced } from "@/lib/hooks/use-reduced";

const { columns } = LANES_COPY;

export default function LaneBoard() {
    const ref = useRef<HTMLDivElement>(null);
    const shown = useInView(ref, REVEAL_VIEWPORT);
    const reduced = useReduced();

    return (
        <div ref={ref}>
            <div className={clsx(LANE_ROW_GRID, "haulr-label text-text-muted border-border border-b pb-3")}>
                <span>{columns.lane}</span>
                <span className="hidden sm:block">{columns.equipment}</span>
                <span className="text-right sm:text-left">{columns.rate}</span>
                <span className="hidden sm:block">{columns.transit}</span>
                <span className="hidden text-right sm:block">{columns.onTime}</span>
            </div>
            <ul>
                {LANE_SAMPLES.map((lane, index) => (
                    <LaneRow
                        key={lane.id}
                        lane={lane}
                        featured={index === 0}
                        order={index}
                        shown={shown || reduced}
                        reduced={reduced}
                    />
                ))}
            </ul>
        </div>
    );
}
