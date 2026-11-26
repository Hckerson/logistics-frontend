"use client";
import Link from "next/link";
import { useMemo } from "react";
import DispatchAccount from "@/components/common/dispatch-account";
import DispatchConflicts from "@/components/common/dispatch-conflicts";
import DispatchGrid from "@/components/common/dispatch-grid";
import DispatchWindows from "@/components/common/dispatch-windows";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { FleetEntryDto, FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { nextDays, planRows, truckName, UNASSIGNED_ROW } from "@/lib/fleet/grid";
import { useNow } from "@/lib/hooks/use-now";
import type { AssignTarget, AvailabilityTarget, PlanRow, PlanView } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    plan: FleetPlanDto;
    view: PlanView | "phone";
    back: string;
    truck: string | undefined;
    onTruck: (truckId: string) => void;
    onWeek: (weeks: number) => void;
    onClear: () => void;
    onAssign: (target: AssignTarget, move?: { entry: FleetEntryDto; from: PlanRow; target: PlanRow }) => void;
    onAvailability: (target: AvailabilityTarget) => void;
}

const { empty, account } = FLEET_COPY;

export default function DispatchPlan({ plan, view, back, truck, onTruck, onWeek, onClear, onAssign, onAvailability }: Props) {
    const now = useNow();
    const rows = useMemo(() => planRows(plan), [plan]);
    const flagged = useMemo(() => new Set(plan.conflicts.filter(({ type }) => type !== "needsAssignment").map(({ loadId }) => loadId)), [plan]);

    if (plan.fleet.length === 0) {
        return (
            <p className="text-text-secondary text-xs">
                {`${empty.noTrucks} `}
                <Link href={appRoutes.fleet()} className={QUIET_LINK}>
                    {empty.addTruck}
                </Link>
            </p>
        );
    }

    if (plan.rows.length === 0) {
        return (
            <p className="text-text-secondary flex flex-wrap items-center gap-2 text-xs">
                {empty.filtered}
                <Button tone="link" size="inline" onPress={onClear}>
                    {FLEET_COPY.filters.clear}
                </Button>
            </p>
        );
    }

    const quiet = plan.unassigned.length === 0 && plan.rows.every(({ entries }) => entries.length === 0);
    const equipment = [...new Set(plan.fleet.map((item) => item.equipment))].join(",");
    const focused = truck ?? plan.fleet[0].id;
    const shared = {
        timeZone: plan.timeZone,
        back,
        readOnly: plan.readOnly,
        onMark: (target: AvailabilityTarget["truck"]) => onAvailability({ truck: target, period: null }),
        onEnd: (target: AvailabilityTarget["truck"], period: AvailabilityTarget["period"]) => onAvailability({ truck: target, period }),
    };

    return (
        <div className="flex flex-col gap-4">
            {plan.readOnly ? <p className="text-text-secondary text-xs">{FLEET_COPY.readOnly}</p> : null}
            <DispatchConflicts plan={plan} back={back} onAssign={(loadId) => onAssign({ loadId })} />
            {quiet ? (
                <p className="text-text-secondary text-xs">
                    {`${empty.noLoads} `}
                    <Link href={`${appRoutes.loadBoard()}${queryString({ equipment })}`} className={QUIET_LINK}>
                        {empty.findLoads}
                    </Link>
                </p>
            ) : null}
            {view === "grid" ? (
                <DispatchGrid
                    {...shared}
                    rows={rows}
                    days={plan.days}
                    flagged={flagged}
                    onWeek={onWeek}
                    onDrop={(entry, target, from) => onAssign({ loadId: entry.loadId, truckId: target.truck?.id, driverId: target.truck?.driverId }, { entry, from, target })}
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {view === "phone" ? (
                        <Select
                            label={account.truckLabel}
                            options={plan.fleet.map((item) => ({ value: item.id, label: truckName(item), detail: item.driverName ?? undefined }))}
                            value={focused}
                            onChange={onTruck}
                        />
                    ) : null}
                    <DispatchAccount
                        {...shared}
                        rows={view === "phone" ? rows.filter(({ key }) => key === focused || key === UNASSIGNED_ROW) : rows}
                        days={view === "phone" ? nextDays(now ?? Date.parse(plan.checkedAt), plan.timeZone) : undefined}
                        onMove={(entry) => onAssign({ loadId: entry.loadId })}
                    />
                </div>
            )}
            <DispatchWindows plan={plan} back={back} />
        </div>
    );
}
