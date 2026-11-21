"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import SegmentedControl from "@/components/ui/segmented-control";
import Select from "@/components/ui/select";
import { TIME_MS } from "@/lib/constants";
import type { FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { ALL_OPTION, FLEET } from "@/lib/fleet/constants";
import { shiftWeek, truckName } from "@/lib/fleet/grid";
import { planCounts, weekRange } from "@/lib/fleet/summary";
import { useNow } from "@/lib/hooks/use-now";
import { ageOf } from "@/lib/tracking/view";
import type { FleetQuery, PlanView } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    plan: FleetPlanDto | undefined;
    query: FleetQuery;
    updatedAt: number;
    wide: boolean;
    view: PlanView;
    onView: (view: PlanView) => void;
    onChange: (query: FleetQuery) => void;
}

const { week, filters, view: viewCopy } = FLEET_COPY;
const FILTER = "w-full sm:w-44";

const chosen = (value: string) => (value === ALL_OPTION ? undefined : value);

export default function DispatchToolbar({ plan, query, updatedAt, wide, view, onView, onChange }: Props) {
    const now = useNow();
    const minutes = now === null || !updatedAt ? 0 : (now - updatedAt) / TIME_MS.minute;
    const fleet = plan?.fleet ?? [];
    const drivers = fleet.flatMap(({ driverId, driverName }) => (driverId && driverName ? [{ value: driverId, label: driverName }] : []));
    const counts = plan ? planCounts(plan) : null;
    const filtered = Boolean(query.truck || query.driver || query.equipment);
    const shift = (weeks: number) => plan && onChange({ ...query, week: shiftWeek(plan.weekStart, weeks) });

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                    <IconButton label={week.previous} icon={ChevronLeft} size="sm" onPress={() => shift(-1)} />
                    <p aria-live="polite" className="text-text min-w-40 text-center text-sm tabular-nums">
                        {plan ? weekRange(plan) : ""}
                    </p>
                    <IconButton label={week.next} icon={ChevronRight} size="sm" onPress={() => shift(1)} />
                    <Button tone="quiet" size="sm" isDisabled={!query.week} onPress={() => onChange({ ...query, week: undefined })}>
                        {week.current}
                    </Button>
                </div>
                {wide ? <SegmentedControl label={viewCopy.label} options={viewCopy.options} value={view} onChange={onView} size="sm" /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {wide ? (
                    <Select
                        label={filters.truck}
                        size="sm"
                        className={FILTER}
                        options={[{ value: ALL_OPTION, label: filters.allTrucks }, ...fleet.map((truck) => ({ value: truck.id, label: truckName(truck), detail: truck.driverName ?? undefined }))]}
                        value={query.truck ?? ALL_OPTION}
                        onChange={(value) => onChange({ ...query, truck: chosen(value) })}
                    />
                ) : null}
                <Select
                    label={filters.driver}
                    size="sm"
                    className={FILTER}
                    options={[{ value: ALL_OPTION, label: filters.allDrivers }, ...drivers]}
                    value={query.driver ?? ALL_OPTION}
                    onChange={(value) => onChange({ ...query, driver: chosen(value) })}
                />
                <Select
                    label={filters.equipment}
                    size="sm"
                    className={FILTER}
                    options={[{ value: ALL_OPTION, label: filters.allEquipment }, ...EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value] }))]}
                    value={query.equipment ?? ALL_OPTION}
                    onChange={(value) => onChange({ ...query, equipment: EQUIPMENT_TYPES.find((kind) => kind === value) })}
                />
                {filtered ? (
                    <Button tone="link" size="inline" onPress={() => onChange({ week: query.week })}>
                        {filters.clear}
                    </Button>
                ) : null}
            </div>
            {counts ? (
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="text-text">{`${counts.assign} · ${counts.conflicts} · ${counts.windows}`}</span>
                    <span className={clsx("tabular-nums", minutes > FLEET.staleMinutes ? "text-signal-warning" : "text-text-muted")}>
                        {fillTemplate(minutes > FLEET.staleMinutes ? FLEET_COPY.stale : FLEET_COPY.checked, { age: ageOf(minutes) })}
                    </span>
                </p>
            ) : null}
        </div>
    );
}
