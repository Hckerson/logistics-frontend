import { TIME_MS } from "@/lib/constants";
import type { FleetConflictDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { FLEET } from "@/lib/fleet/constants";
import { overlaps, spanOf } from "@/lib/mocks/fleet-entries";
import { fleetStore } from "@/lib/mocks/fleet-store";
import type { MockLoad, MockTruck } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";

const coordsOf = (facility: string): [number, number] => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

export const pairConflicts = (truck: MockTruck, loads: readonly MockLoad[]): FleetConflictDto[] => {
    const ordered = [...loads].sort((first, second) => spanOf(first).from - spanOf(second).from);
    return ordered.slice(1).flatMap((next, index) => {
        const previous = ordered[index];
        const gapHours = (spanOf(next).from - spanOf(previous).to) / TIME_MS.hour;
        const drive = milesApart(coordsOf(previous.stops[previous.stops.length - 1].facility), coordsOf(next.stops[0].facility)) / FLEET.averageMph;
        const base = { loadId: next.id, truckId: truck.id, otherLoadId: previous.id, deadline: next.stops[0].windowStart, overdue: false };
        if (overlaps(spanOf(previous), spanOf(next))) return [{ ...base, type: "overlap" as const }];
        return drive > gapHours ? [{ ...base, type: "unreachable" as const }] : [];
    });
};

export const unavailableConflicts = (truck: MockTruck, loads: readonly MockLoad[]): FleetConflictDto[] =>
    [...fleetStore().unavailable.values()]
        .filter((period) => period.truck === truck.id)
        .flatMap((period) =>
            loads.filter((load) => overlaps(spanOf(load), period)).map((load) => ({ type: "unavailable" as const, loadId: load.id, truckId: truck.id, otherLoadId: null, deadline: load.stops[0].windowStart, overdue: false })),
        );
