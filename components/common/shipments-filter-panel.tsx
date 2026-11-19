"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Combobox from "@/components/ui/combobox";
import DateRangeField from "@/components/ui/date-range-field";
import Drawer from "@/components/ui/drawer";
import Field from "@/components/ui/field";
import SegmentedControl from "@/components/ui/segmented-control";
import Switch from "@/components/ui/switch";
import type { LoadFacetsDto, PlaceFacetDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { LOAD_DATE_FIELDS } from "@/lib/loads/shipments";
import { PANEL_CLEARED } from "@/lib/loads/shipment-search";
import { LABEL_TEXT } from "@/lib/ui/constants";
import type { Equipment, ShipmentFilters } from "@/lib/types";

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    filters: ShipmentFilters;
    facets?: LoadFacetsDto;
    wide: boolean;
    onApply: (next: Partial<ShipmentFilters>) => void;
}

const copy = SHIPMENTS_COPY;
const FIELDS = LOAD_DATE_FIELDS.map((value) => ({ value, label: copy.dates.field[value] }));
const cities = (places: readonly PlaceFacetDto[] = []) => places.map(({ city, region }) => ({ value: city, label: `${city}, ${region}` }));

export default function ShipmentsFilterPanel({ isOpen, onOpenChange, filters, facets, wide, onApply }: Props) {
    const [draft, setDraft] = useState(filters);
    const set = (next: Partial<ShipmentFilters>) => {
        setDraft((current) => ({ ...current, ...next }));
        if (wide) onApply(next);
    };
    const toggle = (type: Equipment, on: boolean) => set({ equipment: on ? [...draft.equipment, type] : draft.equipment.filter((item) => item !== type) });
    const apply = () => {
        const { equipment, from, to, dateField, origin, destination, carrier, exceptions } = draft;
        onApply({ equipment, from, to, dateField, origin, destination, carrier, exceptions });
        onOpenChange(false);
    };

    const footer = (
        <div className="flex items-center justify-between gap-2">
            <Button tone="ghost" size="sm" onPress={() => set(PANEL_CLEARED)}>
                {copy.clear}
            </Button>
            <Button size="sm" onPress={wide ? () => onOpenChange(false) : apply}>
                {wide ? copy.done : copy.apply}
            </Button>
        </div>
    );

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} title={copy.more} side="right" width="md" footer={footer}>
            <div className="flex flex-col gap-4 p-4">
                <fieldset className="flex flex-col gap-2">
                    <legend className={`${LABEL_TEXT} mb-2`}>{copy.equipment.label}</legend>
                    {EQUIPMENT_TYPES.map((type) => (
                        <Checkbox key={type} isSelected={draft.equipment.includes(type)} onChange={(on) => toggle(type, on)}>
                            {LOAD_COPY.equipment[type]}
                        </Checkbox>
                    ))}
                </fieldset>
                <Field
                    id="shipments-dates"
                    label={copy.dates.label}
                    aside={<SegmentedControl label={copy.dates.applies} options={FIELDS} value={draft.dateField} onChange={(dateField) => set({ dateField })} size="sm" />}
                >
                    {(control) => (
                        <DateRangeField
                            {...control}
                            value={draft.from && draft.to ? { start: draft.from, end: draft.to } : null}
                            onChange={(range) => set({ from: range?.start ?? null, to: range?.end ?? null })}
                        />
                    )}
                </Field>
                <Field id="shipments-origin" label={copy.origin.label}>
                    {(control) => (
                        <Combobox {...control} options={cities(facets?.origins)} value={draft.origin} onChange={(origin) => set({ origin })} placeholder={copy.origin.placeholder} loading={!facets} />
                    )}
                </Field>
                <Field id="shipments-destination" label={copy.destination.label}>
                    {(control) => (
                        <Combobox
                            {...control}
                            options={cities(facets?.destinations)}
                            value={draft.destination}
                            onChange={(destination) => set({ destination })}
                            placeholder={copy.destination.placeholder}
                            loading={!facets}
                        />
                    )}
                </Field>
                <Field id="shipments-carrier" label={copy.carrier.label}>
                    {(control) => (
                        <Combobox
                            {...control}
                            options={(facets?.carriers ?? []).map(({ id, name }) => ({ value: id, label: name }))}
                            value={draft.carrier}
                            onChange={(carrier) => set({ carrier })}
                            placeholder={copy.carrier.placeholder}
                            loading={!facets}
                        />
                    )}
                </Field>
                <div className="flex flex-col gap-1.5">
                    <Switch label={copy.exceptionsOnly} isSelected={draft.exceptions} onChange={(exceptions) => set({ exceptions })} size="sm" />
                    <p className="text-text-muted text-xs">{copy.exceptionsHint}</p>
                </div>
            </div>
        </Drawer>
    );
}
