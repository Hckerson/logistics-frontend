"use client";
import LoadActionDialog from "@/components/common/load-action-dialog";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoadActions } from "@/lib/hooks/use-loads";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import type { LoadAction } from "@/lib/types";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    load: LoadDto;
    action: LoadAction | null;
    onClose: () => void;
}

export default function ShipmentActionDialog({ load, action, onClose }: Props) {
    const mutation = useLoadActions(load.id);
    const announce = useAnnounce();

    const confirm = (reason: string | undefined) => {
        if (!action || mutation.isPending) return;
        mutation.mutate(
            { to: action.to, version: load.version, reason },
            {
                onSuccess: (next) => {
                    onClose();
                    announce({ message: fillTemplate(LOAD_COPY.actions.done, { action: action.label, status: LOAD_STATUS_LABELS[next.status] }) });
                },
            },
        );
    };

    return (
        <LoadActionDialog
            load={load}
            action={action}
            pending={mutation.isPending}
            failure={mutation.isError ? failureFrom(mutation.error) : null}
            onClose={onClose}
            onConfirm={confirm}
        />
    );
}
