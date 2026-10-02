"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import DeliverStep from "@/components/home/deliver-step";
import { DELIVER_SCENE } from "@/lib/data/home/scenes";
import { DELIVERY } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

const { steps } = DELIVER_SCENE;

export default function DeliverSteps({ progress, reduced }: Props) {
    const fill = useTransform(progress, [...DELIVERY.steps], [0, 1], { clamp: true });
    const reached = useTransform(fill, (share) => Math.ceil(share * steps.length));

    return (
        <div className="relative pl-8">
            <span aria-hidden className="bg-border-dark absolute top-2 bottom-2 left-[5px] w-px">
                <motion.span
                    style={reduced ? undefined : { scaleY: fill }}
                    className="bg-accent absolute inset-0 origin-top"
                />
            </span>
            <ol className="flex flex-col gap-6">
                {steps.map((step, index) => (
                    <DeliverStep
                        key={step.id}
                        index={index}
                        label={step.label}
                        value={step.value}
                        reached={reached}
                        reduced={reduced}
                    />
                ))}
            </ol>
        </div>
    );
}
