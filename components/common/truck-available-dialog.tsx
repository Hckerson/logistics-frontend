"use client";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAnnounce } from "@/components/providers/announcer-provider";
import type { FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { truckName } from "@/lib/fleet/grid";
import { useTruckAvailability } from "@/lib/hooks/use-fleet-plan";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    truck: FleetTruckDto;
    period: FleetUnavailableDto;
    onClose: () => void;
}

const { unavailable: copy, reasons } = FLEET_COPY;

export default function TruckAvailableDialog({ truck, period, onClose }: Props) {
    const { end } = useTruckAvailability(truck.id);
    const announce = useAnnounce();
    const name = truckName(truck);
    const failure = end.isError ? failureFrom(end.error) : null;

    return (
        <ConfirmDialog
            isOpen
            onOpenChange={(open) => (open ? undefined : onClose())}
            kicker={name}
            title={fillTemplate(copy.endTitle, { reason: reasons[period.reason].toLowerCase(), truck: name })}
            consequence={fillTemplate(copy.endBody, { truck: name })}
            confirmLabel={copy.end}
            cancelLabel={copy.keep}
            pending={end.isPending}
            error={failure ? errorMessage(failure) : undefined}
            onConfirm={() =>
                end.mutate(period.id, {
                    onSuccess: () => {
                        announce({ message: fillTemplate(copy.ended, { truck: name }) });
                        onClose();
                    },
                })
            }
        />
    );
}
