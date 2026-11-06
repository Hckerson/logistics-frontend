"use client";
import Panel from "@/components/ui/panel";
import StatusLabel from "@/components/ui/status-label";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useLoadTimeline } from "@/lib/hooks/use-load-timeline";
import { useLoad } from "@/lib/hooks/use-loads";
import { useNow } from "@/lib/hooks/use-now";
import { recentAge } from "@/lib/loads/timeline";
import { stopMoment } from "@/lib/loads/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadDto;
}

const { coverage: copy } = LOAD_RECORD_COPY;

export default function LoadCoverage({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const posted = load.status === "Posted";
    const history = useLoadTimeline(load.id, "status", posted);
    const now = useNow();

    if (!posted) return null;

    const event = history.data?.pages.flatMap((page) => page.items).find((item) => item.toStatus === "Posted");
    const time = event ? (recentAge(event.occurredAt, now) ?? stopMoment(event.occurredAt, load.stops[0].facility.timeZone)) : null;

    return (
        <Panel label={copy.label} aside={<StatusLabel label={copy.status} tone="live" pulse />}>
            <p className="text-text-secondary text-xs">{time ? fillTemplate(copy.posted, { time }) : copy.waiting}</p>
        </Panel>
    );
}
