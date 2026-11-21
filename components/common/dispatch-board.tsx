"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AccountStandingNotice from "@/components/common/account-standing-notice";
import AssignmentDialog from "@/components/common/assignment-dialog";
import AssignmentPreview from "@/components/common/assignment-preview";
import DispatchPlan from "@/components/common/dispatch-plan";
import DispatchToolbar from "@/components/common/dispatch-toolbar";
import SectionFailure from "@/components/common/section-failure";
import SectionState from "@/components/common/section-state";
import TruckAvailabilityDialogs from "@/components/common/truck-availability-dialogs";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { FleetEntryDto, FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET } from "@/lib/fleet/constants";
import { shiftWeek } from "@/lib/fleet/grid";
import { planSummary } from "@/lib/fleet/summary";
import { useFleetPlan } from "@/lib/hooks/use-fleet-plan";
import { useWide } from "@/lib/hooks/use-wide";
import type { AssignTarget, AvailabilityTarget, FleetQuery, PlanRow, PlanView } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    initial: FleetQuery;
}

interface Assigning {
    target: AssignTarget;
    move?: { entry: FleetEntryDto; from: PlanRow; target: PlanRow };
}

export default function DispatchBoard({ initial }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const wide = useWide();
    const announce = useAnnounce();
    const [query, setQuery] = useState(initial);
    const [view, setView] = useState<PlanView>("grid");
    const [assigning, setAssigning] = useState<Assigning | null>(null);
    const [availability, setAvailability] = useState<AvailabilityTarget | null>(null);
    const plan = useFleetPlan(query);
    const seen = useRef<{ week: string; conflicts: number } | null>(null);
    const back = `${pathname}${queryString(query)}`;

    useEffect(() => {
        if (!plan.data) return;
        const last = seen.current;
        const next = { week: plan.data.weekStart, conflicts: plan.data.conflicts.length };
        seen.current = next;
        if (last && (last.week !== next.week || last.conflicts !== next.conflicts)) announce({ message: planSummary(plan.data) });
    }, [plan.data, announce]);

    const change = (next: FleetQuery) => {
        setQuery(next);
        router.replace(`${pathname}${queryString(next)}`, { scroll: false });
    };

    const render = (data: FleetPlanDto) => (
        <DispatchPlan
            plan={data}
            view={wide ? view : "phone"}
            back={back}
            truck={query.truck}
            onTruck={(truck) => change({ ...query, truck })}
            onWeek={(weeks) => change({ ...query, week: shiftWeek(data.weekStart, weeks) })}
            onClear={() => change({ week: query.week, carrier: query.carrier })}
            onAssign={(target, move) => setAssigning({ target, move })}
            onAvailability={setAvailability}
        />
    );

    return (
        <div className="flex flex-col gap-4">
            <AccountStandingNotice />
            <DispatchToolbar plan={plan.data} query={query} updatedAt={plan.dataUpdatedAt} wide={wide} view={view} onView={setView} onChange={change} />
            {plan.data ? (
                <>
                    {plan.isError ? <SectionFailure label={FLEET_COPY.title} failure={failureFrom(plan.error)} onRetry={() => plan.refetch()} /> : null}
                    {render(plan.data)}
                </>
            ) : (
                <SectionState label={FLEET_COPY.title} query={plan}>
                    {render}
                </SectionState>
            )}
            {assigning ? (
                <AssignmentDialog
                    target={assigning.target}
                    preview={assigning.move ? <AssignmentPreview {...assigning.move} /> : undefined}
                    onClose={() => setAssigning(null)}
                />
            ) : null}
            <TruckAvailabilityDialogs target={availability} timeZone={plan.data?.timeZone ?? FLEET.defaultZone} onClose={() => setAvailability(null)} />
        </div>
    );
}
