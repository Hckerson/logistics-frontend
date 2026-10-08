"use client";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import StepLane from "@/components/auth/step-lane";
import ErrorSummary from "@/components/common/error-summary";
import HudPanel from "@/components/common/hud-panel";
import { useAuthSignal } from "@/components/providers/auth-signal-provider";
import { STEP_SLIDE } from "@/lib/auth/constants";
import { problemCount } from "@/lib/auth/problems";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { REVEAL_EASE } from "@/lib/home/constants";
import type { AccountField, AuthSignal, FormProblem } from "@/lib/types";

interface Props {
    label: string;
    status: Record<AuthSignal, string>;
    signal: AuthSignal;
    problems: readonly FormProblem[];
    attempt: number;
    fieldId: (field: AccountField) => string;
    step: string;
    forward: boolean;
    footer: ReactNode;
    children: ReactNode;
}

const SLIDE: Variants = {
    enter: (direction: number) => ({ opacity: 0, x: direction * STEP_SLIDE.distance }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: -direction * STEP_SLIDE.distance }),
};

export default function FlowPanel(props: Props) {
    const { label, status, signal, problems, attempt, fieldId, step, forward, footer, children } = props;
    const { setSignal } = useAuthSignal();
    const direction = forward ? 1 : -1;

    useEffect(() => setSignal(signal), [signal, setSignal]);

    return (
        <HudPanel label={label} status={status[signal]} alert={signal === "held"} note={AUTH_COPY.note} footer={footer}>
            <StepLane signal={signal} />
            <ErrorSummary
                problems={problems}
                attempt={attempt}
                heading={AUTH_COPY.summary.heading}
                count={problemCount(problems.length)}
                fieldId={fieldId}
            />
            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={SLIDE}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: STEP_SLIDE.seconds, ease: REVEAL_EASE }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </HudPanel>
    );
}
