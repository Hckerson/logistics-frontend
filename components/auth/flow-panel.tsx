"use client";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import TicketLane from "@/components/auth/ticket-lane";
import StepFrame from "@/components/auth/step-frame";
import TicketPerforation from "@/components/auth/ticket-perforation";
import ErrorSummary from "@/components/common/error-summary";
import HudPanel from "@/components/common/hud-panel";
import { useAuthSignal } from "@/components/providers/auth-signal-provider";
import { ASSEMBLY, ENTRY, STEP_SLIDE } from "@/lib/auth/constants";
import { problemCount } from "@/lib/auth/problems";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import type { AccountField, AuthSignal, FormProblem } from "@/lib/types";

interface Props {
    label: string;
    status: Record<AuthSignal, string>;
    signal: AuthSignal;
    problems: readonly FormProblem[];
    attempt: number;
    fieldId: (field: AccountField) => string;
    step: string;
    leg?: number;
    footer: ReactNode;
    children: ReactNode;
}

const ASSEMBLE_MS = ASSEMBLY.note * ASSEMBLY.unit * 1000;

export default function FlowPanel(props: Props) {
    const { label, status, signal, problems, attempt, fieldId, step, leg = 0, footer, children } = props;
    const { setSignal, setLeg, booted } = useAuthSignal();
    const [boot] = useState<number>(booted ? ENTRY.rewrite : ENTRY.catch);
    const [assembled, setAssembled] = useState(false);
    const content = assembled ? ENTRY.rewrite : boot + ASSEMBLY.content * ASSEMBLY.unit;

    useEffect(() => setSignal(signal), [signal, setSignal]);
    useEffect(() => setLeg(leg), [leg, setLeg]);

    useEffect(() => {
        const done = setTimeout(() => setAssembled(true), boot * 1000 + ASSEMBLE_MS);
        return () => clearTimeout(done);
    }, [boot]);

    return (
        <HudPanel
            label={label}
            status={status[signal]}
            alert={signal === "held"}
            note={AUTH_COPY.note}
            footer={footer}
            boot={boot}
        >
            <TicketLane signal={signal} leg={leg} delay={boot + ASSEMBLY.codes * ASSEMBLY.unit} />
            <TicketPerforation />
            <ErrorSummary
                problems={problems}
                attempt={attempt}
                heading={AUTH_COPY.summary.heading}
                count={problemCount(problems.length)}
                fieldId={fieldId}
            />
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} exit={{ opacity: 0 }} transition={{ duration: STEP_SLIDE.seconds }}>
                    <StepFrame base={content}>{children}</StepFrame>
                </motion.div>
            </AnimatePresence>
        </HudPanel>
    );
}
