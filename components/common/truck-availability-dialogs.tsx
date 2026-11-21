"use client";
import TruckAvailableDialog from "@/components/common/truck-available-dialog";
import TruckUnavailableForm from "@/components/common/truck-unavailable-form";
import Dialog from "@/components/ui/dialog";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { truckName } from "@/lib/fleet/grid";
import type { AvailabilityTarget } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    target: AvailabilityTarget | null;
    timeZone: string;
    onClose: () => void;
}

export default function TruckAvailabilityDialogs({ target, timeZone, onClose }: Props) {
    if (target?.period) return <TruckAvailableDialog truck={target.truck} period={target.period} onClose={onClose} />;

    return (
        <Dialog
            isOpen={target !== null}
            onOpenChange={(open) => (open ? undefined : onClose())}
            title={target ? fillTemplate(FLEET_COPY.unavailable.title, { truck: truckName(target.truck) }) : ""}
        >
            {target ? <TruckUnavailableForm key={target.truck.id} truck={target.truck} timeZone={timeZone} onClose={onClose} /> : null}
        </Dialog>
    );
}
