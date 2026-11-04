"use client";
import { useMemo, useRef, useState } from "react";
import { ArrowRight } from "@carbon/icons-react";
import LoadActionDialog from "@/components/common/load-action-dialog";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import Skeleton from "@/components/ui/skeleton";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { actorsOf } from "@/lib/auth/capabilities";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoadTimeline } from "@/lib/hooks/use-load-timeline";
import { useLoadActions, useLoad } from "@/lib/hooks/use-loads";
import { useNow } from "@/lib/hooks/use-now";
import { nextActions, previousStatus } from "@/lib/loads/next-actions";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { canReturn } from "@/lib/loads/transitions";
import type { ErrorClass, LoadAction } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: LoadDto;
}

const { actions: copy } = LOAD_COPY;
const MOVED_ON: readonly ErrorClass[] = ["conflict", "precondition", "not-found"];

const keyOf = ({ kind, to }: LoadAction) => `${kind}-${to}`;

export default function LoadActions({ initial }: Props) {
    const { data: load = initial, refetch } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const returnable = actorsOf(roles).some((actor) => canReturn(load.status, actor));
    const history = useLoadTimeline(load.id, "status", returnable);
    const events = useMemo(() => history.data?.pages.flatMap((page) => page.items) ?? [], [history.data]);
    const now = useNow();
    const previous = returnable && now !== null ? previousStatus(load.status, events, now) : null;
    const settling = returnable && (now === null || history.isPending);
    const actions = nextActions(load, roles, previous);
    const mutation = useLoadActions(load.id);
    const announce = useAnnounce();
    const panel = useRef<HTMLDivElement>(null);
    const [chosen, setChosen] = useState<LoadAction | null>(null);
    const [running, setRunning] = useState<string | null>(null);
    const failure = mutation.isError ? failureFrom(mutation.error) : null;

    const run = (action: LoadAction, reason?: string) => {
        if (mutation.isPending) return;
        setRunning(keyOf(action));
        mutation.mutate(
            { to: action.to, version: load.version, reason },
            {
                onSuccess: (next) => {
                    setChosen(null);
                    announce({ message: fillTemplate(copy.done, { action: action.label, status: LOAD_STATUS_LABELS[next.status] }) });
                    panel.current?.focus();
                },
                onError: (error) => {
                    const failed = failureFrom(error);
                    if (failed && MOVED_ON.includes(failed.errorClass)) void refetch();
                },
                onSettled: () => setRunning(null),
            },
        );
    };

    const press = (action: LoadAction) => {
        mutation.reset();
        if (action.confirm) setChosen(action);
        else run(action);
    };

    return (
        <Panel label={copy.label}>
            <div ref={panel} tabIndex={-1} className="flex flex-col gap-2 outline-none">
                {actions.length === 0 && settling ? <Skeleton lines={2} /> : null}
                {actions.length === 0 && !settling ? (
                    <p className="text-text-secondary text-xs">{copy.none}</p>
                ) : (
                    actions.map((action, index) => {
                        const lead = index === 0 && !action.destructive;
                        return (
                            <Button
                                key={keyOf(action)}
                                tone={action.destructive ? "danger" : lead ? "ink" : "outline"}
                                size={lead ? "wide" : "md"}
                                trailing={lead ? ArrowRight : undefined}
                                pending={running === keyOf(action) && !chosen}
                                pendingLabel={copy.pending}
                                isDisabled={mutation.isPending && running !== keyOf(action)}
                                onPress={() => press(action)}
                                className={lead ? undefined : "w-full"}
                            >
                                {action.label}
                            </Button>
                        );
                    })
                )}
                {failure && !chosen ? (
                    <p role="alert" className="text-error text-xs">
                        {errorMessage(failure)}
                    </p>
                ) : null}
            </div>
            <LoadActionDialog
                key={chosen ? keyOf(chosen) : "closed"}
                load={load}
                action={chosen}
                pending={mutation.isPending}
                failure={chosen ? failure : null}
                onClose={() => setChosen(null)}
                onConfirm={(reason) => {
                    if (chosen) run(chosen, reason);
                }}
            />
        </Panel>
    );
}
