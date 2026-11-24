"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FleetDrivers from "@/components/common/fleet-drivers";
import FleetInvitations from "@/components/common/fleet-invitations";
import FleetRemoval from "@/components/common/fleet-removal";
import FleetVehicleEditor from "@/components/common/fleet-vehicle-editor";
import FleetVehicles from "@/components/common/fleet-vehicles";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { FleetVehicleDto } from "@/lib/contract/schemas";
import type { RosterRemoval, VehicleQuery } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    initial: VehicleQuery;
}

interface Opened<T> {
    open: boolean;
    target: T;
    key: number;
}

export default function FleetRoster({ initial }: Props) {
    const pathname = usePathname();
    const canEdit = can(useSession()?.roles ?? [], "editVehicles");
    const [query, setQuery] = useState(initial);
    const [editor, setEditor] = useState<Opened<FleetVehicleDto | null>>({ open: false, target: null, key: 0 });
    const [removal, setRemoval] = useState<Opened<RosterRemoval | null>>({ open: false, target: null, key: 0 });
    const back = `${pathname}${queryString(query)}`;

    useEffect(() => {
        window.history.replaceState(null, "", back);
    }, [back]);

    const edit = (target: FleetVehicleDto | null) => setEditor((current) => ({ open: true, target, key: current.key + 1 }));
    const remove = (target: RosterRemoval) => setRemoval((current) => ({ open: true, target, key: current.key + 1 }));

    return (
        <div className="flex flex-col gap-6">
            <FleetVehicles query={query} onQuery={setQuery} canEdit={canEdit} back={back} onEdit={edit} onRetire={(vehicle) => remove({ kind: "retire", vehicle })} />
            <FleetDrivers back={back} onDeactivate={(driver) => remove({ kind: "deactivate", driver })} />
            <FleetInvitations onRevoke={(invitation) => remove({ kind: "revoke", invitation })} />
            <FleetVehicleEditor key={editor.key} isOpen={editor.open} vehicle={editor.target} onClose={() => setEditor((current) => ({ ...current, open: false }))} />
            {removal.target ? (
                <FleetRemoval key={removal.key} isOpen={removal.open} removal={removal.target} onClose={() => setRemoval((current) => ({ ...current, open: false }))} />
            ) : null}
        </div>
    );
}
