import clsx from "clsx";
import type { LoadEventDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { LOAD_STATUS_LABELS, LOAD_STATUS_TONES } from "@/lib/loads/status";
import { eventActor, eventTitle, recentAge } from "@/lib/loads/timeline";
import { stopMoment } from "@/lib/loads/view";
import { SIGNAL_TONES } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    event: LoadEventDto;
    zone: string;
    now: number | null;
    last: boolean;
}

const { timeline: copy } = LOAD_RECORD_COPY;

export default function LoadEvent({ event, zone, now, last }: Props) {
    const { toStatus, fromStatus, occurredAt, reason, note } = event;
    const age = recentAge(occurredAt, now);
    const notes = [
        { id: "reason", label: copy.reason, text: reason },
        { id: "note", label: copy.note, text: note },
    ];

    return (
        <li className="flex gap-3">
            <span aria-hidden className="relative flex w-2 shrink-0 justify-center pt-1.5">
                <span
                    className={clsx("relative z-10 size-1.5 rounded-full bg-current", toStatus ? SIGNAL_TONES[LOAD_STATUS_TONES[toStatus]] : "text-text-muted")}
                />
                {last ? null : <span className="bg-border-dark absolute top-3.5 -bottom-1.5 w-px" />}
            </span>
            <div className={clsx("flex min-w-0 flex-1 flex-col gap-0.5", !last && "pb-3")}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-text text-xs">
                        {eventTitle(event)}
                        {fromStatus && toStatus ? (
                            <span className="text-text-muted"> {fillTemplate(copy.from, { status: LOAD_STATUS_LABELS[fromStatus] })}</span>
                        ) : null}
                    </p>
                    <time dateTime={occurredAt} className="text-text-muted font-mono text-xs">
                        {stopMoment(occurredAt, zone)}
                    </time>
                </div>
                <p className="text-text-muted text-xs">
                    {eventActor(event)}
                    {age ? ` · ${age}` : ""}
                </p>
                {notes.map(({ id, label, text }) =>
                    text ? (
                        <p key={id} className="text-text-secondary border-border-dark mt-1 border-l-2 pl-2 text-xs">
                            <span className="text-text-muted">{label}: </span>
                            {text}
                        </p>
                    ) : null,
                )}
            </div>
        </li>
    );
}
