"use client";
import { useState } from "react";
import AssignmentDeadline from "@/components/common/assignment-deadline";
import AssignmentDialog from "@/components/common/assignment-dialog";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { LoadDto } from "@/lib/contract/schemas";
import { ASSIGNMENT_COPY } from "@/lib/data/fleet/assignment";
import { MOVABLE_STATUSES } from "@/lib/fleet/constants";
import { truckName } from "@/lib/fleet/grid";
import { assignmentDeadline } from "@/lib/fleet/time";
import { useLoad } from "@/lib/hooks/use-loads";
import { stopMoment } from "@/lib/loads/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadDto;
}

const { load: copy, sourceNames } = ASSIGNMENT_COPY;

export default function LoadAssignment({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const [open, setOpen] = useState(false);
    const assigner = can(roles, "assignLoad");
    const movable = MOVABLE_STATUSES.some((status) => status === load.status);
    const { assignment } = load;

    if (!load.carrier || (!assignment && !(assigner && movable))) return null;

    const pickup = load.stops[0];
    const deadline = new Date(assignmentDeadline(pickup.windowStart)).toISOString();

    return (
        <>
            <Panel label={ASSIGNMENT_COPY.panel}>
                {assignment ? (
                    <div className="flex flex-col gap-1 text-xs">
                        <p className="text-text">{fillTemplate(copy.assigned, { driver: assignment.driverName, truck: truckName({ unit: assignment.truckUnit }) })}</p>
                        {assigner ? (
                            <p className="text-text-muted">
                                {`${fillTemplate(copy.via, { source: sourceNames[assignment.trackingSource] })} · ${fillTemplate(copy.since, { time: stopMoment(assignment.assignedAt, pickup.facility.timeZone) })}`}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <p className="text-text text-xs">{copy.none}</p>
                        <AssignmentDeadline deadline={deadline} timeZone={pickup.facility.timeZone} />
                    </div>
                )}
                {assigner && assignment && !movable ? <p className="text-text-muted text-xs">{copy.locked}</p> : null}
                {assigner && movable ? (
                    <Button tone={assignment ? "outline" : "ink"} size="sm" className="self-start" onPress={() => setOpen(true)}>
                        {assignment ? copy.reassign : copy.assign}
                    </Button>
                ) : null}
            </Panel>
            {open ? <AssignmentDialog target={{ loadId: load.id }} onClose={() => setOpen(false)} /> : null}
        </>
    );
}
