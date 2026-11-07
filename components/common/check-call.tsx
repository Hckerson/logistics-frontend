"use client";
import { useMemo } from "react";
import { PhoneOutgoing } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { TIME_MS } from "@/lib/constants";
import type { LoadPositionsDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useCheckCall } from "@/lib/hooks/use-load-positions";
import { useLoadTimeline } from "@/lib/hooks/use-load-timeline";
import { useNow } from "@/lib/hooks/use-now";
import { TRACKING } from "@/lib/loads/constants";
import { actorOf } from "@/lib/loads/timeline";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf, clockTime } from "@/lib/tracking/view";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    loadId: string;
    health: LoadPositionsDto["health"];
    zone: string;
}

const { tracking: copy } = LOAD_COPY;
const REPEAT_MS = TRACKING.checkCallRepeatMinutes * TIME_MS.minute;

export default function CheckCall({ loadId, health, zone }: Props) {
    const request = useCheckCall(loadId);
    const history = useLoadTimeline(loadId, "tracking");
    const announce = useAnnounce();
    const now = useNow();
    const failure = request.isError ? failureFrom(request.error) : null;
    const quiet = health === "stale" || health === "exception";
    const last = useMemo(() => history.data?.pages.flatMap((page) => page.items).find((event) => event.type === "checkCallRequested") ?? null, [history.data]);
    const opensAt = last ? Date.parse(last.occurredAt) + REPEAT_MS : null;
    const waiting =
        last && opensAt !== null && now !== null && now < opensAt
            ? fillTemplate(copy.checkCallRecentBy, {
                  name: actorOf(last),
                  age: ageOf(minutesSince(last.occurredAt, now)),
                  time: clockTime(new Date(opensAt).toISOString(), zone),
              })
            : null;
    const blocked = waiting ?? (quiet ? null : copy.checkCallClosed);

    const ask = () => request.mutate({}, { onSuccess: () => announce({ message: copy.checkCallDone }) });

    if (request.isSuccess) return <p className="text-accent text-xs">{copy.checkCallDone}</p>;

    return (
        <div className="flex flex-col gap-2">
            <Button
                tone="outline"
                icon={PhoneOutgoing}
                pending={request.isPending}
                pendingLabel={copy.checkCallPending}
                disabledReason={blocked ?? undefined}
                onPress={ask}
                className="self-start"
            >
                {copy.checkCall}
            </Button>
            {blocked ? <p className="text-text-muted text-xs">{blocked}</p> : null}
            {failure ? (
                <p role="alert" className="text-error text-xs">
                    {failure.errorClass === "conflict" ? copy.checkCallRecent : errorMessage(failure)}
                </p>
            ) : null}
        </div>
    );
}
