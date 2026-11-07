import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import type { ShipmentParam } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    dropped: readonly ShipmentParam[];
}

export default function ShipmentsReset({ dropped }: Props) {
    if (dropped.length === 0) return null;
    const names = [...new Set(dropped)].map((param) => SHIPMENTS_COPY.paramNames[param]).join(", ");

    return (
        <p role="status" className="text-signal-warning text-xs">
            {fillTemplate(pluralize(dropped.length, SHIPMENTS_COPY.reset), { names })}
        </p>
    );
}
