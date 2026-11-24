"use client";
import Link from "next/link";
import { Subtract } from "@carbon/icons-react";
import DataTable from "@/components/ui/data-table";
import { appRoutes } from "@/lib/app-routes";
import type { FleetDriverDto } from "@/lib/contract/schemas";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { useFleetRoster } from "@/lib/hooks/use-fleet";
import { withBack } from "@/lib/navigation/back";
import type { MenuEntry, TableColumn } from "@/lib/types";
import { RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    back: string;
    onDeactivate: (driver: FleetDriverDto) => void;
}

const { drivers: copy, none } = ROSTER_COPY;
const muted = (text: string) => <span className="text-text-muted">{text}</span>;

const columns = (back: string): TableColumn<FleetDriverDto>[] => [
    {
        key: "driver",
        label: copy.columns.driver,
        rowHeader: true,
        cell: (driver) => (
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-text">{driver.name}</span>
                <span className="text-text-muted truncate text-xs" title={driver.email}>
                    {driver.email}
                </span>
            </span>
        ),
    },
    {
        key: "now",
        label: copy.columns.now,
        width: "8rem",
        phone: "aside",
        cell: (driver) =>
            driver.currentLoadId ? (
                <Link href={withBack(appRoutes.load(driver.currentLoadId), back)} className={RECORD_LINK}>
                    {driver.currentLoadId}
                </Link>
            ) : (
                muted(copy.available)
            ),
    },
    { key: "truck", label: copy.columns.truck, width: "6rem", cell: (driver) => (driver.truckUnit ? <span className="font-mono">{driver.truckUnit}</span> : muted(none)) },
    {
        key: "sharing",
        label: copy.columns.sharing,
        width: "9rem",
        phone: "hidden",
        cell: (driver) => (driver.locationSharing === "granted" ? copy.sharing.granted : muted(copy.sharing[driver.locationSharing])),
    },
];

export default function FleetDrivers({ back, onDeactivate }: Props) {
    const roster = useFleetRoster();
    const rows = roster.data?.drivers ?? [];

    const items = (driver: FleetDriverDto): MenuEntry[] => [
        {
            id: "deactivate",
            label: copy.deactivate,
            icon: Subtract,
            destructive: true,
            disabledReason: driver.currentLoadId ? fillTemplate(copy.busy, { load: driver.currentLoadId }) : undefined,
        },
    ];

    return (
        <DataTable
            caption={copy.caption}
            count={roster.data ? rows.length : undefined}
            columns={columns(back)}
            rows={rows}
            rowKey={(driver) => driver.id}
            rowLabel={(driver) => driver.name}
            rowSignature={(driver) => `${driver.currentLoadId ?? ""}-${driver.truckUnit ?? ""}-${driver.locationSharing}`}
            menu={{ items, onAction: onDeactivate }}
            loading={roster.isPending}
            failed={roster.isError}
            onRetry={() => void roster.refetch()}
            empty={<span className="text-text-secondary text-xs">{copy.empty}</span>}
        />
    );
}
