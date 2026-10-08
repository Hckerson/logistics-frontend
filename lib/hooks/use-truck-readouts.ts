import { useTransform, type MotionValue } from "motion/react";
import { TRACK_PANEL as PANEL } from "@/lib/data/home/panels";
import { truckAt } from "@/lib/home/lane";
import { lerp } from "@/lib/home/math";

export function useTruckReadouts(progress: MotionValue<number>) {
    const travelled = useTransform(progress, truckAt);
    const eta = useTransform(
        travelled,
        (share) =>
            `${PANEL.eta.prefix}${Math.round(lerp(PANEL.confidence.from, PANEL.confidence.to, share))} ${PANEL.eta.unit}`,
    );
    const remaining = useTransform(
        travelled,
        (share) => `${Math.round(lerp(PANEL.miles.from, PANEL.miles.to, share))} ${PANEL.remaining.unit}`,
    );

    return { travelled, eta, remaining };
}
