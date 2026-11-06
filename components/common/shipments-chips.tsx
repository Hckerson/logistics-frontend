"use client";
import Button from "@/components/ui/button";
import FilterChip from "@/components/ui/filter-chip";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import type { AppliedFilter, ShipmentParam } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    applied: readonly AppliedFilter[];
    onRemove: (id: ShipmentParam) => void;
    onClear: () => void;
}

export default function ShipmentsChips({ applied, onRemove, onClear }: Props) {
    if (applied.length === 0) return null;

    return (
        <div role="group" aria-label={SHIPMENTS_COPY.applied} className="flex flex-wrap items-center gap-1.5">
            {applied.map((filter) => (
                <FilterChip key={filter.id} label={filter.label} removeLabel={fillTemplate(SHIPMENTS_COPY.remove, { label: filter.label })} onRemove={() => onRemove(filter.id)} />
            ))}
            <Button tone="link" size="inline" onPress={onClear} className="ml-1">
                {SHIPMENTS_COPY.clearAll}
            </Button>
        </div>
    );
}
