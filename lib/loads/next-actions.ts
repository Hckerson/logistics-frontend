import { actorsOf } from "@/lib/auth/capabilities";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import type { LoadDto, LoadEventDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { STOP_EVENT_UNDO_MINUTES, UNDOABLE_LOAD_STATUSES } from "@/lib/loads/constants";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { stopFits } from "@/lib/loads/stops";
import { minutesSince } from "@/lib/loads/tracking";
import { canReturn, nextStatuses } from "@/lib/loads/transitions";
import type { LoadAction, LoadStatus, RoleKey } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

const DECIDED_ELSEWHERE: readonly LoadStatus[] = ["PendingApproval", "Booked"];
const REASONED: readonly LoadStatus[] = ["OnHold", "Cancelled", "Disputed"];
const RELEASED_FROM: readonly LoadStatus[] = ["Booked", "Dispatched"];
const TARGET_LABELS: Partial<Record<LoadStatus, string>> = LOAD_COPY.actions.targets;
const MOVE_LABELS: Readonly<Record<string, string>> = LOAD_COPY.actions.moves;
const RETURN_LABELS: Partial<Record<LoadStatus, string>> = LOAD_COPY.actions.returns;
const CONSEQUENCES: Partial<Record<LoadStatus, string>> = LOAD_COPY.actions.consequence;
const { consequence } = LOAD_COPY.actions;

const TRAILING: readonly LoadStatus[] = ["OnHold", "Disputed"];

export const previousStatus = (status: LoadStatus, events: readonly LoadEventDto[], now: number) => {
    const last = events
        .filter((event) => event.type === "statusChanged" && event.toStatus === status)
        .reduce<LoadEventDto | null>((latest, event) => (!latest || event.occurredAt > latest.occurredAt ? event : latest), null);
    if (!last?.fromStatus) return null;
    return UNDOABLE_LOAD_STATUSES.includes(status) && minutesSince(last.occurredAt, now) > STOP_EVENT_UNDO_MINUTES ? null : last.fromStatus;
};

export const nextActions = (load: LoadDto, roles: readonly RoleKey[], previous: LoadStatus | null): LoadAction[] => {
    const actors = actorsOf(roles);
    const staff = hasAnyRole(roles, ROLE_GROUPS.internal);
    const from = load.status;
    const needsReason = (to: LoadStatus) => staff || from === "OnHold" || REASONED.includes(to);

    const moves = [...new Set(actors.flatMap((actor) => nextStatuses(from, actor)))]
        .filter((to) => !DECIDED_ELSEWHERE.includes(to) && stopFits(to, load.stops))
        .map((to): LoadAction => {
            const release = to === "Posted" && RELEASED_FROM.includes(from);
            return {
                to,
                label: MOVE_LABELS[`${from}>${to}`] ?? TARGET_LABELS[to] ?? to,
                kind: "move",
                consequence: release ? consequence.release : (CONSEQUENCES[to] ?? fillTemplate(consequence.move, { status: LOAD_STATUS_LABELS[to] })),
                reason: needsReason(to),
                confirm: release || needsReason(to),
                penalty: release && actors.includes("Carrier"),
                destructive: to === "Cancelled",
            };
        });

    const undo: LoadAction[] =
        previous && !moves.some((move) => move.to === previous) && actors.some((actor) => canReturn(from, actor))
            ? [
                  {
                      to: previous,
                      label: RETURN_LABELS[from] ?? previous,
                      kind: "return",
                      consequence: fillTemplate(consequence.return, { status: LOAD_STATUS_LABELS[previous] }),
                      reason: needsReason(previous),
                      confirm: needsReason(previous),
                      penalty: false,
                      destructive: false,
                  },
              ]
            : [];

    const rank = ({ to, kind, destructive }: LoadAction) =>
        destructive ? 3 : TRAILING.includes(to) || (to === "Posted" && RELEASED_FROM.includes(from)) ? 2 : kind === "return" ? 1 : 0;
    return [...moves, ...undo].sort((first, second) => rank(first) - rank(second));
};

