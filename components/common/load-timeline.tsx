"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadEvent from "@/components/common/load-event";
import SectionFailure from "@/components/common/section-failure";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import SegmentedControl from "@/components/ui/segmented-control";
import Skeleton from "@/components/ui/skeleton";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useLoadTimeline } from "@/lib/hooks/use-load-timeline";
import { useLoad } from "@/lib/hooks/use-loads";
import { useNow } from "@/lib/hooks/use-now";
import { zoneAt } from "@/lib/loads/timeline";
import type { TimelineFilter } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    initial: LoadDto;
}

const { timeline: copy } = LOAD_RECORD_COPY;

export default function LoadTimeline({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const [filter, setFilter] = useState<TimelineFilter>("all");
    const timeline = useLoadTimeline(load.id, filter === "all" ? undefined : filter);
    const events = useMemo(() => timeline.data?.pages.flatMap((page) => page.items) ?? [], [timeline.data]);
    const now = useNow();
    const announce = useAnnounce();
    const seen = useRef<{ filter: TimelineFilter; id: string } | null>(null);
    const newest = events[0]?.id;
    const kind = copy.filters.find((option) => option.value === filter)?.label ?? "";

    useEffect(() => {
        if (!newest) return;
        const prior = seen.current;
        const count = prior && prior.filter === filter ? events.findIndex((event) => event.id === prior.id) : 0;
        if (count > 0) announce({ message: pluralize(count, copy.arrived) });
        seen.current = { filter, id: newest };
    }, [newest, filter, events, announce]);

    return (
        <Panel label={copy.label}>
            <SegmentedControl size="sm" label={copy.filterLabel} options={copy.filters} value={filter} onChange={setFilter} className="self-start" />
            {timeline.isPending ? <Skeleton lines={4} /> : null}
            {timeline.isError && events.length === 0 ? (
                <SectionFailure label={copy.label} failure={failureFrom(timeline.error)} onRetry={() => timeline.refetch()} />
            ) : null}
            {timeline.isSuccess && events.length === 0 ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-text-muted text-xs">{filter === "all" ? copy.unposted : fillTemplate(copy.filtered, { kind: kind.toLowerCase() })}</p>
                    {filter === "all" ? null : (
                        <Button tone="link" size="inline" onPress={() => setFilter("all")}>
                            {copy.showAll}
                        </Button>
                    )}
                </div>
            ) : null}
            {events.length > 0 ? (
                <ol aria-label={copy.label} className="flex flex-col">
                    {events.map((event, index) => (
                        <LoadEvent key={event.id} event={event} zone={zoneAt(load.stops, event.occurredAt)} now={now} last={index === events.length - 1} />
                    ))}
                </ol>
            ) : null}
            {timeline.hasNextPage ? (
                <Button
                    tone="outline"
                    size="sm"
                    pending={timeline.isFetchingNextPage}
                    pendingLabel={copy.loadingOlder}
                    onPress={() => void timeline.fetchNextPage()}
                    className="self-start"
                >
                    {copy.older}
                </Button>
            ) : null}
        </Panel>
    );
}
