"use client";
import { useState } from "react";
import { ArrowRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import StatusLabel from "@/components/ui/status-label";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_FILE_STATES, SPECIMEN_JOURNEY, SPECIMEN_SIGNALS } from "@/lib/data/primitives/samples";
import { loadStatusDisplay } from "@/lib/loads/status";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";

const { specimens, demo } = PRIMITIVES_COPY;

export default function PrimitivesStatusLabels() {
    const [step, setStep] = useState(0);

    return (
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {SPECIMEN_SIGNALS.map((signal) => (
                    <li key={`${signal.status}-${signal.qualifier}`}>
                        <StatusLabel {...loadStatusDisplay(signal.status, signal.qualifier)} />
                    </li>
                ))}
            </ul>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2.5">
                    <p className={LABEL_TEXT}>{specimens.journey}</p>
                    <div className="flex items-center justify-between gap-4">
                        <StatusLabel {...loadStatusDisplay(SPECIMEN_JOURNEY[step])} />
                        <Button tone="outline" size="sm" trailing={ArrowRight} onPress={() => setStep((current) => (current + 1) % SPECIMEN_JOURNEY.length)}>
                            {demo.nextStage}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    <p className={LABEL_TEXT}>{specimens.plainStatus}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {SPECIMEN_FILE_STATES.map(({ state, tone, pulse }) => (
                            <StatusLabel key={state} label={UI_COPY.fileStates[state]} tone={tone} pulse={pulse} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
