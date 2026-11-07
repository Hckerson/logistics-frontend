import type { LoadEventDto, StopDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

const { timeline: copy } = LOAD_RECORD_COPY;
const DAY_MINUTES = 24 * 60;

export const zoneAt = (stops: readonly Pick<StopDto, "departedAt" | "facility">[], iso: string) =>
    (stops.find((stop) => !stop.departedAt || Date.parse(stop.departedAt) >= Date.parse(iso)) ?? stops[stops.length - 1]).facility.timeZone;

export const eventTitle = ({ type, toStatus, city }: LoadEventDto) =>
    fillTemplate(copy.events[type], { status: toStatus ? LOAD_STATUS_LABELS[toStatus] : "", city: city ?? "" });

export const actorOf = ({ actorName, actorType }: Pick<LoadEventDto, "actorName" | "actorType">) => actorName ?? copy.actors[actorType];

export const eventActor = (event: LoadEventDto) => `${actorOf(event)} · ${copy.sources[event.source]}`;

export const recentAge = (iso: string, now: number | null) => {
    if (now === null) return null;
    const minutes = minutesSince(iso, now);
    return minutes < DAY_MINUTES ? ageOf(minutes) : null;
};
