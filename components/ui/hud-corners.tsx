import clsx from "clsx";
import { CORNER_TONES } from "@/lib/ui/constants";
import type { CornerTone } from "@/lib/types";

interface Props {
    tone?: CornerTone;
    className?: string;
}

const CORNERS = [
    "-top-px -left-px border-t border-l [--haulr-snap-x:-2.5rem] [--haulr-snap-y:-2.5rem]",
    "-top-px -right-px border-t border-r [--haulr-snap-x:2.5rem] [--haulr-snap-y:-2.5rem]",
    "-bottom-px -left-px border-b border-l [--haulr-snap-x:-2.5rem] [--haulr-snap-y:2.5rem]",
    "-right-px -bottom-px border-r border-b [--haulr-snap-x:2.5rem] [--haulr-snap-y:2.5rem]",
];

export default function HudCorners({ tone = "muted", className }: Props) {
    return (
        <span aria-hidden>
            {CORNERS.map((corner) => (
                <span key={corner} className={clsx("pointer-events-none absolute block size-3", CORNER_TONES[tone], corner, className)} />
            ))}
        </span>
    );
}
