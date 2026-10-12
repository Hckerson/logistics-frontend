import { ACTIVE_LOAD_STATUSES, UNDOABLE_LOAD_STATUSES } from "@/lib/loads/constants";
import type { LoadActor, LoadStatus } from "@/lib/types";

interface LoadMove {
    from: readonly LoadStatus[];
    to: LoadStatus;
    actors: readonly LoadActor[];
}

interface LoadReturn {
    from: readonly LoadStatus[];
    actors: readonly LoadActor[];
}

const STOP_ACTORS: readonly LoadActor[] = ["Driver", "Carrier", "Operations"];
const TRACKED_ACTORS: readonly LoadActor[] = ["Driver", "Carrier", "System", "Operations"];

export const LOAD_MOVES: readonly LoadMove[] = [
    { from: ["Draft"], to: "Posted", actors: ["Shipper", "Operations"] },
    { from: ["Draft"], to: "PendingApproval", actors: ["Shipper"] },
    { from: ["PendingApproval"], to: "Posted", actors: ["Approver"] },
    { from: ["PendingApproval"], to: "Draft", actors: ["Approver", "Shipper", "System"] },
    { from: ["Draft"], to: "Cancelled", actors: ["Shipper"] },
    { from: ["Expired"], to: "Draft", actors: ["Shipper"] },
    { from: ["Posted"], to: "Booked", actors: ["Carrier", "Operations"] },
    { from: ["Posted"], to: "Expired", actors: ["System"] },
    { from: ["Posted"], to: "Cancelled", actors: ["Shipper", "Operations"] },
    { from: ["Booked"], to: "Dispatched", actors: ["Carrier", "Operations"] },
    { from: ["Booked", "Dispatched"], to: "Posted", actors: ["Carrier", "Operations"] },
    { from: ["Booked", "Dispatched"], to: "Cancelled", actors: ["Shipper", "Operations"] },
    { from: ["Dispatched"], to: "AtPickup", actors: TRACKED_ACTORS },
    { from: ["AtPickup"], to: "InTransit", actors: STOP_ACTORS },
    { from: ["InTransit"], to: "AtPickup", actors: TRACKED_ACTORS },
    { from: ["InTransit"], to: "AtDelivery", actors: TRACKED_ACTORS },
    { from: ["AtDelivery"], to: "InTransit", actors: STOP_ACTORS },
    { from: ["AtDelivery"], to: "Delivered", actors: STOP_ACTORS },
    { from: ["Delivered"], to: "PodVerified", actors: ["System", "Finance"] },
    { from: ["PodVerified"], to: "Invoiced", actors: ["System"] },
    { from: ["Invoiced"], to: "Paid", actors: ["System"] },
    { from: ["Paid"], to: "Closed", actors: ["System"] },
    { from: ACTIVE_LOAD_STATUSES, to: "OnHold", actors: ["Operations", "Compliance"] },
    { from: ["Invoiced", "Paid"], to: "Disputed", actors: ["Shipper", "Carrier"] },
    { from: ["AtPickup"], to: "Cancelled", actors: ["Operations"] },
];

export const LOAD_RETURNS: readonly LoadReturn[] = [
    { from: UNDOABLE_LOAD_STATUSES, actors: STOP_ACTORS },
    { from: ["OnHold"], actors: ["Operations"] },
    { from: ["Disputed"], actors: ["Finance"] },
];

const allows = (rule: { from: readonly LoadStatus[]; actors: readonly LoadActor[] }, from: LoadStatus, actor: LoadActor) =>
    rule.from.includes(from) && rule.actors.includes(actor);

export const nextStatuses = (from: LoadStatus, actor: LoadActor): LoadStatus[] =>
    LOAD_MOVES.filter((move) => allows(move, from, actor)).map((move) => move.to);

export const canMove = (from: LoadStatus, to: LoadStatus, actor: LoadActor) => nextStatuses(from, actor).includes(to);

export const canReturn = (from: LoadStatus, actor: LoadActor) => LOAD_RETURNS.some((rule) => allows(rule, from, actor));
