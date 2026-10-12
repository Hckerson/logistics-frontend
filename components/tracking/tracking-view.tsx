"use client";
import { useEffect, useRef } from "react";
import PageIntro from "@/components/common/page-intro";
import { useAnnounce } from "@/components/providers/announcer-provider";
import TrackingArrival from "@/components/tracking/tracking-arrival";
import TrackingEnded from "@/components/tracking/tracking-ended";
import TrackingLink from "@/components/tracking/tracking-link";
import TrackingPosition from "@/components/tracking/tracking-position";
import TrackingStops from "@/components/tracking/tracking-stops";
import TrackingWait from "@/components/tracking/tracking-wait";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { useClock } from "@/lib/hooks/use-clock";
import { useTracking } from "@/lib/hooks/use-tracking";
import { trackingLead } from "@/lib/tracking/lead";
import { longDate, phaseOf, shortTime } from "@/lib/tracking/view";
import type { TrackingRead } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    token: string;
    read: Exclude<TrackingRead, { kind: "missing" }>;
}

export default function TrackingView({ token, read }: Props) {
    const query = useTracking(token, read.kind === "found" ? read.snapshot : undefined);
    const now = useClock();
    const announce = useAnnounce();
    const tracking = query.data;
    const phase = tracking ? phaseOf(tracking) : null;
    const seen = useRef(phase);
    const zone = tracking?.stops[tracking.stops.length - 1]?.timeZone ?? "UTC";

    useEffect(() => {
        if (phase === "delivered" && seen.current && seen.current !== "delivered" && tracking?.deliveredAt) {
            announce({ message: fillTemplate(TRACKING_COPY.announce, { time: shortTime(tracking.deliveredAt, zone) }) });
        }
        seen.current = phase;
    }, [phase, tracking?.deliveredAt, zone, announce]);

    if (!tracking) {
        return (
            <>
                <PageIntro eyebrow={TRACKING_COPY.missing.eyebrow} title={TRACKING_COPY.problems.title} lead={TRACKING_COPY.problems.lead} />
                <TrackingWait wait={read.kind === "rate-limited" ? read.wait : 0} pending={query.isFetching} onRetry={() => query.refetch()} />
            </>
        );
    }

    const eyebrow = fillTemplate(TRACKING_COPY.eyebrow, { reference: tracking.reference, sharedBy: tracking.sharedBy });

    if (tracking.expired) {
        const ended = tracking.expiresAt ? fillTemplate(TRACKING_COPY.ended.lead, { date: longDate(tracking.expiresAt, zone) }) : "";
        return (
            <>
                <PageIntro eyebrow={eyebrow} title={TRACKING_COPY.ended.title} lead={ended} />
                <TrackingEnded tracking={tracking} />
                <TrackingLink tracking={tracking} />
            </>
        );
    }

    return (
        <>
            <PageIntro eyebrow={eyebrow} title={TRACKING_COPY.phases[phase ?? "scheduled"]} lead={trackingLead(tracking)} />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
                <div className="lg:order-first">
                    <TrackingPosition tracking={tracking} now={now} />
                </div>
                <div className="order-first flex flex-col gap-8 lg:order-none">
                    <TrackingArrival tracking={tracking} />
                    <TrackingStops stops={tracking.stops} />
                </div>
            </div>
            <TrackingLink tracking={tracking} />
        </>
    );
}
