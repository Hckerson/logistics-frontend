"use client";
import LoadStop from "@/components/common/load-stop";
import Panel from "@/components/ui/panel";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoad } from "@/lib/hooks/use-loads";
import { STOP_INSTRUCTIONS } from "@/lib/loads/constants";
import { currentStop } from "@/lib/loads/view";

interface Props {
    initial: LoadDto;
}

export default function LoadStops({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const current = currentStop(load.stops);
    const roles = useSession()?.roles ?? [];
    const open = can(roles, "editStopInstructions") && STOP_INSTRUCTIONS.openStatuses.some((status) => status === load.status);

    return (
        <Panel label={LOAD_COPY.stops.label} aside={<span className="haulr-label text-text-muted">{load.stops.length}</span>}>
            <ol className="flex flex-col">
                {load.stops.map((stop, index) => (
                    <LoadStop
                        key={stop.id}
                        loadId={load.id}
                        version={load.version}
                        stop={stop}
                        current={stop.id === current?.id}
                        last={index === load.stops.length - 1}
                        editable={open && !stop.arrivedAt}
                    />
                ))}
            </ol>
        </Panel>
    );
}
