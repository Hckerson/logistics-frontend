"use client";
import { PhoneOutgoing } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { LoadPositionsDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useCheckCall } from "@/lib/hooks/use-load-positions";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";

interface Props {
    loadId: string;
    health: LoadPositionsDto["health"];
}

const { tracking: copy } = LOAD_COPY;

export default function CheckCall({ loadId, health }: Props) {
    const request = useCheckCall(loadId);
    const announce = useAnnounce();
    const failure = request.isError ? failureFrom(request.error) : null;
    const quiet = health === "stale" || health === "exception";

    const ask = () =>
        request.mutate({}, { onSuccess: () => announce({ message: copy.checkCallDone }) });

    if (request.isSuccess) return <p className="text-accent text-xs">{copy.checkCallDone}</p>;

    return (
        <div className="flex flex-col gap-2">
            <Button
                tone="outline"
                icon={PhoneOutgoing}
                pending={request.isPending}
                pendingLabel={copy.checkCallPending}
                disabledReason={quiet ? undefined : copy.checkCallClosed}
                onPress={ask}
                className="self-start"
            >
                {copy.checkCall}
            </Button>
            {quiet ? null : <p className="text-text-muted text-xs">{copy.checkCallClosed}</p>}
            {failure ? (
                <p role="alert" className="text-error text-xs">
                    {failure.errorClass === "conflict" ? copy.checkCallRecent : errorMessage(failure)}
                </p>
            ) : null}
        </div>
    );
}
