"use client";
import { useState } from "react";
import { Notification } from "@carbon/icons-react";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import CountBadge from "@/components/ui/count-badge";
import Countdown from "@/components/ui/countdown";
import IconButton from "@/components/ui/icon-button";
import Kbd from "@/components/ui/kbd";
import ProgressLine from "@/components/ui/progress-line";
import Skeleton from "@/components/ui/skeleton";
import StatusLabel from "@/components/ui/status-label";
import { TIME_MS } from "@/lib/constants";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_HOLD_MINUTES, SPECIMEN_SHORTCUT, SPECIMEN_SIGNALS } from "@/lib/data/primitives/samples";

const { sections, specimens, demo } = PRIMITIVES_COPY;
const WARN_SECONDS = 300;

export default function PrimitivesStatus() {
    const [unread, setUnread] = useState(3);
    const [deadline] = useState(() => new Date().getTime() + SPECIMEN_HOLD_MINUTES * TIME_MS.minute);

    return (
        <PrimitivesSection {...sections.status}>
            <PrimitivesSpecimen label={specimens.signals} contract="IC-59" wide>
                {SPECIMEN_SIGNALS.map((signal) => (
                    <StatusLabel key={signal.label} {...signal} className="mr-4" />
                ))}
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.counts} contract="IC-53 · IC-49">
                <span className="relative inline-flex">
                    <IconButton label={demo.unread} icon={Notification} onPress={() => setUnread((count) => count + 1)} />
                    <CountBadge value={unread} label={demo.unread} className="absolute -top-0.5 -right-0.5" />
                </span>
                <CountBadge value={128} tone="muted" />
                <span className="text-text-muted ml-2 inline-flex items-center gap-2 text-xs">
                    {demo.quickFind}
                    <Kbd keys={SPECIMEN_SHORTCUT} />
                </span>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.countdown} contract="IC-46">
                <span className="text-text-secondary inline-flex items-center gap-2 text-xs">
                    {demo.countdownLabel}
                    <Countdown deadline={deadline} warnAt={WARN_SECONDS} />
                </span>
                <Countdown deadline={deadline} format="words" className="text-xs" />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.loading} contract="LS-1 · LS-5">
                <div className="flex w-full flex-col gap-3">
                    <Skeleton lines={3} />
                    <ProgressLine className="bg-border w-full" />
                </div>
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
