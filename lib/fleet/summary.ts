import type { FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { dayLabel } from "@/lib/fleet/grid";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

const { counts, week } = FLEET_COPY;

export const planCounts = (plan: FleetPlanDto) => ({
    assign: pluralize(plan.unassigned.length, counts.assign),
    conflicts: pluralize(plan.conflicts.length, counts.conflicts),
    windows: pluralize(
        plan.rows.reduce((total, row) => total + row.windows.length, 0),
        counts.windows,
    ),
});

export const planSummary = (plan: FleetPlanDto) => fillTemplate(week.announce, { start: dayLabel(plan.weekStart), ...planCounts(plan) });

export const weekRange = (plan: FleetPlanDto) => fillTemplate(week.range, { start: dayLabel(plan.days[0]), end: dayLabel(plan.days[plan.days.length - 1]) });
