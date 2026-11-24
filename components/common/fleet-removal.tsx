"use client";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { useDeactivateDriver, useInvitationActions, useRetireVehicle } from "@/lib/hooks/use-fleet";
import type { RosterRemoval } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    isOpen: boolean;
    removal: RosterRemoval;
    onClose: () => void;
}

const { confirm: copy } = ROSTER_COPY;

const phrasing = (removal: RosterRemoval) => {
    if (removal.kind === "retire") return { text: copy.retire, values: { unit: removal.vehicle.unit } };
    if (removal.kind === "deactivate") return { text: copy.deactivate, values: { name: removal.driver.name } };
    return { text: copy.revoke, values: { email: removal.invitation.email } };
};

export default function FleetRemoval({ isOpen, removal, onClose }: Props) {
    const retire = useRetireVehicle();
    const deactivate = useDeactivateDriver();
    const { revoke } = useInvitationActions();
    const announce = useAnnounce();
    const { text, values } = phrasing(removal);
    const running = removal.kind === "retire" ? retire : removal.kind === "deactivate" ? deactivate : revoke;
    const failure = running.isError ? failureFrom(running.error) : null;
    const busy = failure?.errorClass === "conflict" && "busy" in text ? fillTemplate(text.busy, values) : null;

    const confirm = () => {
        const onSuccess = () => {
            announce({ message: fillTemplate(text.done, values) });
            onClose();
        };
        if (removal.kind === "retire") retire.mutate(removal.vehicle, { onSuccess });
        else if (removal.kind === "deactivate") deactivate.mutate(removal.driver.id, { onSuccess });
        else revoke.mutate(removal.invitation.id, { onSuccess });
    };

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onOpenChange={(open) => (open ? undefined : onClose())}
            title={fillTemplate(text.title, values)}
            consequence={fillTemplate(text.consequence, values)}
            confirmLabel={fillTemplate(text.confirm, values)}
            cancelLabel={copy.cancel}
            onConfirm={confirm}
            pending={running.isPending}
            destructive
            error={failure ? (busy ?? errorMessage(failure)) : undefined}
        />
    );
}
