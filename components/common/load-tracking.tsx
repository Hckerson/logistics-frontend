"use client";
import { useState } from "react";
import CheckCall from "@/components/common/check-call";
import LoadMap from "@/components/common/load-map";
import LoadPosition from "@/components/common/load-position";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import SegmentedControl from "@/components/ui/segmented-control";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SECTION_COPY } from "@/lib/errors/constants";
import { useLoadRoute } from "@/lib/hooks/use-load-route";
import { useLoadPositions } from "@/lib/hooks/use-load-positions";
import { useLoad } from "@/lib/hooks/use-loads";
import { useWide } from "@/lib/hooks/use-wide";
import { TRACKED_STATUSES } from "@/lib/loads/constants";
import type { TrackingView } from "@/lib/types";

interface Props {
    initial: LoadDto;
}

const { tracking: copy } = LOAD_COPY;

export default function LoadTracking({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const allowed = can(roles, "viewLiveLocation");
    const positions = useLoadPositions(load.id, allowed);
    const wide = useWide();
    const [chosen, setChosen] = useState<TrackingView | null>(null);
    const route = useLoadRoute(load, positions.data);

    if (!allowed) return null;

    const view = chosen ?? (wide ? "map" : "text");
    const health = positions.data?.health ?? null;
    const stale = health === "stale" || health === "exception";
    const checkCall = can(roles, "requestCheckCall") && TRACKED_STATUSES.includes(load.status);

    return (
        <Panel label={copy.label} flush aside={<SegmentedControl size="sm" label={copy.viewLabel} options={copy.views} value={view} onChange={setChosen} />}>
            {view === "map" ? (
                <div className="border-border relative h-72 border-b lg:h-104">
                    <LoadMap load={load} positions={positions.data} route={route} stale={stale} />
                </div>
            ) : null}
            <div className="flex flex-col gap-3 p-4">
                <LoadPosition load={load} positions={positions.data} />
                {positions.isError ? (
                    <div className="border-error flex flex-wrap items-center justify-between gap-2 border-l-2 pl-3">
                        <p className="text-text text-xs">{copy.paused}</p>
                        <Button tone="quiet" size="sm" onPress={() => positions.refetch()}>
                            {SECTION_COPY.retry}
                        </Button>
                    </div>
                ) : null}
                {checkCall ? <CheckCall loadId={load.id} health={health} /> : null}
            </div>
        </Panel>
    );
}
