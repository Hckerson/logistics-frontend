import { appRoutes } from "@/lib/app-routes";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { backTo } from "@/lib/navigation/back";
import type { Crumb, RoleKey } from "@/lib/types";

const PARENTS = {
    dashboard: (): Crumb => ({ label: LOAD_COPY.trail.root, href: appRoutes.dashboard() }),
    shipments: (back: string | null): Crumb => ({ label: SHIPMENTS_COPY.title, href: backTo(back, appRoutes.shipments()) }),
    plan: (back: string | null): Crumb => ({ label: FLEET_COPY.title, href: backTo(back, appRoutes.dispatchBoard()) }),
    loadBoard: (back: string | null): Crumb => ({ label: LOAD_BOARD_COPY.title, href: backTo(back, appRoutes.loadBoard()) }),
    trips: (): Crumb => ({ label: DRIVER_COPY.home.title, href: appRoutes.driverHome() }),
    invoices: (): Crumb => ({ label: LOAD_COPY.trail.invoices, href: null }),
};

export const loadTrail = (roles: readonly RoleKey[], back: string | null): Crumb[] => {
    if (hasAnyRole(roles, ROLE_GROUPS.shipper)) return [PARENTS.shipments(back)];
    if (hasAnyRole(roles, ROLE_GROUPS.carrier)) return [PARENTS.plan(back)];
    return [PARENTS.dashboard()];
};

export const bookingTrail = (loadId: string, back: string | null): Crumb[] => [PARENTS.loadBoard(back), { label: loadId, href: null }];

export const invoiceTrail = (): Crumb[] => [PARENTS.invoices()];

export const importTrail = (back: string | null): Crumb[] => [PARENTS.shipments(back)];

export const tripTrail = (): Crumb[] => [PARENTS.trips()];
