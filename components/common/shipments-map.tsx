"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import HudCorners from "@/components/ui/hud-corners";
import Panel from "@/components/ui/panel";
import Skeleton from "@/components/ui/skeleton";
import StatusLabel from "@/components/ui/status-label";
import SectionBoundary from "@/components/wrappers/section-boundary";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto, MapPositionDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { TRACKING } from "@/lib/loads/constants";
import { shipmentQualifier, shortMoment } from "@/lib/loads/shipments";
import { loadStatusDisplay } from "@/lib/loads/status";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";
import type { CollectionVehicle } from "@/lib/types";
import { useCurrentPath } from "@/lib/hooks/use-current-path";
import { withBack } from "@/lib/navigation/back";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    rows: readonly LoadSummaryDto[];
    positions?: readonly MapPositionDto[];
    loading: boolean;
    updatedAt: number;
    filters: number;
}

const { map } = SHIPMENTS_COPY;

export default function ShipmentsMap({ rows, positions = [], loading, updatedAt, filters }: Props) {
    const router = useRouter();
    const back = useCurrentPath();
    const fixes = useMemo(() => {
        const byId = new Map(rows.map((row) => [row.id, row]));
        return positions.flatMap((fix) => {
            const load = byId.get(fix.loadId);
            return load ? [{ load, fix }] : [];
        });
    }, [rows, positions]);
    const vehicles = useMemo(
        (): CollectionVehicle[] =>
            fixes.map(({ load, fix }) => ({
                id: load.id,
                position: [fix.longitude, fix.latitude],
                label: `${load.id} · ${fix.city}`,
                stale: minutesSince(fix.recordedAt, updatedAt) > TRACKING.staleMinutes,
                late: load.eta?.late ?? false,
            })),
        [fixes, updatedAt],
    );

    if (!loading && fixes.length === 0) {
        return (
            <Panel label={map.list}>
                <p className="text-text-muted text-xs">{filters > 0 ? pluralize(filters, map.noneFiltered) : map.none}</p>
            </Panel>
        );
    }

    return (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="border-border-dark relative h-80 border sm:h-[28rem]">
                <HudCorners />
                <SectionBoundary label={map.label}>
                    <FreightMap label={map.label} recentreLabel={map.recentre} precision="city" vehicles={vehicles} onSelect={(id) => router.push(withBack(appRoutes.load(id), back))} />
                </SectionBoundary>
            </div>
            <Panel label={map.list} aside={<span className="text-text-muted text-xs">{map.page}</span>} flush>
                {loading && fixes.length === 0 ? (
                    <Skeleton lines={4} className="p-4" />
                ) : (
                    <ul className="max-h-[28rem] overflow-y-auto">
                        {fixes.map(({ load, fix }) => (
                            <li key={load.id} className="border-border-light flex flex-col gap-1 border-b px-4 py-2.5 text-xs last:border-b-0">
                                <div className="flex items-center justify-between gap-3">
                                    <Link href={withBack(appRoutes.load(load.id), back)} className={RECORD_LINK}>
                                        {load.id}
                                    </Link>
                                    <StatusLabel {...loadStatusDisplay(load.status, shipmentQualifier(load, updatedAt))} />
                                </div>
                                <p className="text-text-secondary">{fillTemplate(map.fix, { place: fix.city, age: ageOf(minutesSince(fix.recordedAt, updatedAt)) })}</p>
                                {load.eta ? <p className="text-text-muted">{fillTemplate(map.eta, { time: shortMoment(load.eta.at, load.destination.timeZone) })}</p> : null}
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
}
