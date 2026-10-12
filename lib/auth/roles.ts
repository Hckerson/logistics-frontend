import type { RoleKey } from "@/lib/types";

export const ROLE_GROUPS = {
    shipper: ["shipper.member", "shipper.admin", "shipper.finance", "shipper.approver"],
    carrier: ["carrier.dispatcher", "carrier.admin"],
    driver: ["carrier.driver"],
    internal: ["internal.ops", "internal.compliance", "internal.finance", "internal.support", "internal.admin"],
} as const satisfies Record<string, readonly RoleKey[]>;

export const hasAnyRole = (held: readonly RoleKey[], allowed: readonly RoleKey[]) => held.some((role) => allowed.includes(role));
