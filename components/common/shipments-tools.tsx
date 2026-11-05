"use client";
import SearchField from "@/components/ui/search-field";
import Select from "@/components/ui/select";
import Switch from "@/components/ui/switch";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import type { ShipmentFilters } from "@/lib/types";

interface Props {
    search: string;
    onSearch: (value: string) => void;
    filters: ShipmentFilters;
    onChange: (next: Partial<ShipmentFilters>) => void;
}

const ANY = "any";
const { search: searchCopy, equipment } = SHIPMENTS_COPY;
const EQUIPMENT = [{ value: ANY, label: equipment.any }, ...EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value] }))];

export default function ShipmentsTools({ search, onSearch, filters, onChange }: Props) {
    const pickEquipment = (value: string) => onChange({ equipment: EQUIPMENT_TYPES.find((type) => type === value) ?? null });

    return (
        <div role="group" aria-label={SHIPMENTS_COPY.filters} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="w-full sm:w-72">
                <SearchField label={searchCopy.label} placeholder={searchCopy.placeholder} value={search} onChange={onSearch} />
            </div>
            <div className="w-40">
                <Select label={equipment.label} options={EQUIPMENT} value={filters.equipment ?? ANY} onChange={pickEquipment} />
            </div>
            <Switch label={SHIPMENTS_COPY.lateOnly} isSelected={filters.late} onChange={(late) => onChange({ late })} size="sm" />
        </div>
    );
}
