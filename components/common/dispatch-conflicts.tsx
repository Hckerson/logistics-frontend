"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import CountBadge from "@/components/ui/count-badge";
import Panel from "@/components/ui/panel";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { FleetConflictDto, FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { truckName } from "@/lib/fleet/grid";
import { stopMoment } from "@/lib/loads/view";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    plan: FleetPlanDto;
    onAssign: (loadId: string) => void;
}

const { conflicts: copy } = FLEET_COPY;

const sentence = (conflict: FleetConflictDto, plan: FleetPlanDto) => {
    const truck = plan.fleet.find(({ id }) => id === conflict.truckId);
    const values = {
        load: conflict.loadId,
        other: conflict.otherLoadId ?? "",
        truck: truck ? truckName(truck) : "",
        deadline: conflict.deadline ? stopMoment(conflict.deadline, plan.timeZone) : "",
    };
    return fillTemplate(conflict.overdue ? copy.overdue : copy.types[conflict.type], values);
};

export default function DispatchConflicts({ plan, onAssign }: Props) {
    const { conflicts } = plan;

    return (
        <Panel label={copy.label} aside={conflicts.length > 0 ? <CountBadge value={conflicts.length} tone="muted" label={pluralize(conflicts.length, FLEET_COPY.counts.conflicts)} /> : null}>
            {conflicts.length === 0 ? (
                <p className="text-text-secondary text-xs">{fillTemplate(copy.none, { time: stopMoment(plan.checkedAt, plan.timeZone) })}</p>
            ) : (
                <ol className="flex flex-col gap-1">
                    {conflicts.map((conflict) => (
                        <li
                            key={`${conflict.type}:${conflict.loadId}:${conflict.otherLoadId ?? ""}`}
                            className="border-signal-warning flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-l-2 py-1.5 pl-3 text-xs"
                        >
                            <span className="text-text min-w-0 flex-1">{sentence(conflict, plan)}</span>
                            <span className="flex items-center gap-3">
                                {conflict.overdue ? <StatusLabel label={copy.late} tone="danger" /> : null}
                                {conflict.type === "needsAssignment" && !plan.readOnly ? (
                                    <Button tone="outline" size="sm" onPress={() => onAssign(conflict.loadId)}>
                                        {copy.assign}
                                    </Button>
                                ) : (
                                    <Link href={appRoutes.load(conflict.loadId)} className={QUIET_LINK}>
                                        {fillTemplate(copy.open, { load: conflict.loadId })}
                                    </Link>
                                )}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </Panel>
    );
}
