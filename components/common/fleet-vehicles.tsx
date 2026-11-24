"use client";
import Link from "next/link";
import { Add, Edit, TrashCan } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import Select from "@/components/ui/select";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import type { FleetVehicleDto } from "@/lib/contract/schemas";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { ALL_OPTION } from "@/lib/fleet/constants";
import { eldText } from "@/lib/fleet/roster";
import { useFleetVehicles } from "@/lib/hooks/use-fleet";
import { useNow } from "@/lib/hooks/use-now";
import { withBack } from "@/lib/navigation/back";
import type { MenuEntry, TableColumn, VehicleQuery } from "@/lib/types";
import { RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    query: VehicleQuery;
    onQuery: (query: VehicleQuery) => void;
    canEdit: boolean;
    back: string;
    onEdit: (vehicle: FleetVehicleDto | null) => void;
    onRetire: (vehicle: FleetVehicleDto) => void;
}

const { vehicles: copy, eld, kindNames, none } = ROSTER_COPY;
const EQUIPMENT_OPTIONS = [{ value: ALL_OPTION, label: copy.allEquipment }, ...EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value] }))];
const muted = (text: string) => <span className="text-text-muted">{text}</span>;

export default function FleetVehicles({ query, onQuery, canEdit, back, onEdit, onRetire }: Props) {
    const vehicles = useFleetVehicles(query);
    const now = useNow();
    const rows = vehicles.data ?? [];

    const columns: TableColumn<FleetVehicleDto>[] = [
        {
            key: "unit",
            label: copy.columns.unit,
            rowHeader: true,
            width: "7rem",
            cell: (vehicle) => (
                <span className="flex flex-col gap-0.5">
                    <span className="text-text font-mono">{vehicle.unit}</span>
                    <span className="haulr-label text-text-muted">{kindNames[vehicle.kind]}</span>
                </span>
            ),
        },
        { key: "equipment", label: copy.columns.equipment, width: "7.5rem", cell: (vehicle) => LOAD_COPY.equipment[vehicle.equipment] },
        { key: "driver", label: copy.columns.driver, phone: "aside", cell: (vehicle) => vehicle.driverName ?? muted(none) },
        { key: "plate", label: copy.columns.plate, width: "8.5rem", phone: "hidden", cell: (vehicle) => <span className="font-mono">{fillTemplate(copy.plate, { state: vehicle.plateState, plate: vehicle.plate })}</span> },
        { key: "vin", label: copy.columns.vin, width: "11.5rem", phone: "hidden", cell: (vehicle) => <span className="text-text-secondary font-mono">{vehicle.vin}</span> },
        {
            key: "eld",
            label: copy.columns.eld,
            width: "10.5rem",
            cell: (vehicle) => (vehicle.eld && now !== null ? <StatusLabel label={eldText(vehicle.eld, now)} tone={eld.tones[vehicle.eld.state]} /> : muted(none)),
        },
        {
            key: "now",
            label: copy.columns.now,
            width: "8rem",
            cell: (vehicle) =>
                vehicle.currentLoadId ? (
                    <Link href={withBack(appRoutes.load(vehicle.currentLoadId), back)} className={RECORD_LINK}>
                        {vehicle.currentLoadId}
                    </Link>
                ) : (
                    muted(vehicle.kind === "truck" ? copy.available : none)
                ),
        },
    ];

    const items = (vehicle: FleetVehicleDto): MenuEntry[] => [
        { id: "edit", label: copy.menu.edit, icon: Edit },
        { id: "retire", label: copy.menu.retire, icon: TrashCan, destructive: true, disabledReason: vehicle.currentLoadId ? fillTemplate(copy.busy, { load: vehicle.currentLoadId }) : undefined },
    ];

    const empty = query.equipment ? (
        <span className="flex flex-col items-start gap-2">
            {copy.filtered}
            <Button tone="link" size="inline" onPress={() => onQuery({})}>
                {copy.showAll}
            </Button>
        </span>
    ) : canEdit ? (
        <span className="flex flex-col items-start gap-3">
            {copy.empty}
            <Button tone="outline" size="sm" icon={Add} onPress={() => onEdit(null)}>
                {copy.add}
            </Button>
        </span>
    ) : (
        copy.emptyRead
    );

    return (
        <DataTable
            caption={copy.caption}
            count={vehicles.data ? rows.length : undefined}
            tools={
                <span className="flex flex-wrap items-center gap-2">
                    <Select
                        label={copy.equipment}
                        size="sm"
                        options={EQUIPMENT_OPTIONS}
                        value={query.equipment ?? ALL_OPTION}
                        onChange={(value) => onQuery({ equipment: EQUIPMENT_TYPES.find((type) => type === value) })}
                    />
                    {canEdit ? (
                        <Button tone="ink" size="sm" icon={Add} onPress={() => onEdit(null)}>
                            {copy.add}
                        </Button>
                    ) : null}
                </span>
            }
            columns={columns}
            rows={rows}
            rowKey={(vehicle) => vehicle.id}
            rowLabel={(vehicle) => fillTemplate(copy.rowLabel, { kind: kindNames[vehicle.kind], unit: vehicle.unit })}
            rowSignature={(vehicle) => `${vehicle.version}-${vehicle.currentLoadId ?? ""}`}
            menu={canEdit ? { items, onAction: (vehicle, id) => (id === "edit" ? onEdit(vehicle) : onRetire(vehicle)) } : undefined}
            loading={vehicles.isPending || vehicles.isPlaceholderData}
            failed={vehicles.isError}
            onRetry={() => void vehicles.refetch()}
            empty={<span className="text-text-secondary text-xs">{empty}</span>}
        />
    );
}
