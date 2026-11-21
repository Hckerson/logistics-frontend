"use client";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useConnectivity } from "@/lib/hooks/use-connectivity";
import { useNow } from "@/lib/hooks/use-now";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    savedAt: number | null;
    stale: boolean;
}

const { saved: copy } = DRIVER_COPY;

export default function DriverSaved({ savedAt, stale }: Props) {
    const now = useNow();
    const offline = useConnectivity().state === "offline";
    if (savedAt === null) return null;

    const age = now === null ? "" : ageOf(minutesSince(new Date(savedAt).toISOString(), now));
    const text = offline ? fillTemplate(copy.offline, { age }) : stale ? fillTemplate(copy.cached, { age }) : copy.live;

    return <p className="text-text-muted text-xs">{text}</p>;
}
