import LaneProgress from "@/components/common/lane-progress";
import StatusLabel from "@/components/ui/status-label";
import { loadStatusDisplay } from "@/lib/loads/status";
import type { SpecimenLoad } from "@/lib/types";

interface Props {
    load: SpecimenLoad;
}

export default function PrimitivesLoadDetail({ load }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-text text-sm">
                    <span className="font-mono">{load.reference}</span>
                    <span className="text-text-muted"> · {load.carrier}</span>
                </p>
                <StatusLabel {...loadStatusDisplay(load.status, load.qualifier)} />
            </div>
            <LaneProgress from={load.originCode} to={load.destinationCode} progress={load.progress} />
            <p className="text-text-muted font-mono text-xs">{load.pickup}</p>
        </div>
    );
}
