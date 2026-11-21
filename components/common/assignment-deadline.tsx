"use client";
import Countdown from "@/components/ui/countdown";
import { TIME_MS } from "@/lib/constants";
import { ASSIGNMENT_COPY } from "@/lib/data/fleet/assignment";
import { useNow } from "@/lib/hooks/use-now";
import { clockTime, dayName } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    deadline: string;
    timeZone: string;
}

const COUNTDOWN_SECONDS = TIME_MS.hour / TIME_MS.second;

export default function AssignmentDeadline({ deadline, timeZone }: Props) {
    const now = useNow();
    const left = now === null ? null : Date.parse(deadline) - now;
    const time = `${dayName(deadline, timeZone)}, ${clockTime(deadline, timeZone)}`;

    if (left !== null && left <= 0) return <p className="text-signal-danger text-xs">{fillTemplate(ASSIGNMENT_COPY.deadlinePassed, { time })}</p>;

    return (
        <p className="text-text-secondary flex flex-wrap items-baseline gap-x-2 text-xs">
            <span>{fillTemplate(ASSIGNMENT_COPY.deadline, { time })}</span>
            {left !== null && left <= TIME_MS.hour ? (
                <Countdown deadline={deadline} format="words" warnAt={COUNTDOWN_SECONDS} label={ASSIGNMENT_COPY.countdown} />
            ) : null}
        </p>
    );
}
