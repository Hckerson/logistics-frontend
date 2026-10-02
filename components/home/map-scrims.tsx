"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
}

export default function MapScrims({ progress }: Props) {
    const right = useTransform(progress, [SCENES.hero[1] - 0.03, SCENES.quote[0] + 0.07], [0, 1]);

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
            <div className="from-background via-background/70 absolute inset-x-0 top-[40%] h-40 bg-linear-to-b to-transparent lg:hidden" />
            <div className="from-background via-background/75 absolute inset-y-0 left-0 hidden w-[52%] bg-linear-to-r to-transparent lg:block" />
            <motion.div
                style={{ opacity: right }}
                className="from-background via-background/75 absolute inset-y-0 right-0 hidden w-[46%] bg-linear-to-l to-transparent lg:block"
            />
            <div className="from-background absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent" />
        </div>
    );
}
