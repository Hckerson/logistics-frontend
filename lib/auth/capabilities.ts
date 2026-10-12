import { hasAnyRole } from "@/lib/auth/roles";
import { LOAD_ACTORS } from "@/lib/loads/constants";
import type { LoadActor, RoleKey } from "@/lib/types";

export const CAPABILITY_ROLES = {
    viewShipperPrice: ["shipper.member", "shipper.admin", "shipper.finance", "internal.ops", "internal.finance", "internal.support"],
    viewCarrierPay: ["carrier.dispatcher", "carrier.admin", "internal.ops", "internal.finance", "internal.support"],
    viewLiveLocation: ["shipper.member", "shipper.admin", "carrier.dispatcher", "carrier.admin", "internal.ops", "internal.support"],
    shareTrackingLink: ["shipper.member", "shipper.admin", "internal.ops", "internal.support"],
    requestCheckCall: ["carrier.dispatcher", "carrier.admin", "internal.ops"],
    uploadDocument: ["shipper.member", "shipper.admin", "carrier.dispatcher", "carrier.admin", "internal.ops", "internal.finance"],
} as const satisfies Record<string, readonly RoleKey[]>;

export type Capability = keyof typeof CAPABILITY_ROLES;

export const ACTOR_ROLES = {
    Shipper: ["shipper.member", "shipper.admin"],
    Approver: ["shipper.approver"],
    Carrier: ["carrier.dispatcher", "carrier.admin"],
    Driver: ["carrier.driver"],
    Operations: ["internal.ops"],
    Compliance: ["internal.compliance"],
    Finance: ["internal.finance"],
    System: [],
} as const satisfies Record<LoadActor, readonly RoleKey[]>;

export const can = (roles: readonly RoleKey[], capability: Capability) => hasAnyRole(roles, CAPABILITY_ROLES[capability]);

export const actorsOf = (roles: readonly RoleKey[]): LoadActor[] =>
    LOAD_ACTORS.filter((actor) => hasAnyRole(roles, ACTOR_ROLES[actor]));
