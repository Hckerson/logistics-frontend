"use client";
import LoadStop from "@/components/common/load-stop";
import Panel from "@/components/ui/panel";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useLoad } from "@/lib/hooks/use-loads";
import { currentStop } from "@/lib/loads/view";

interface Props {
    initial: LoadDto;
}

export default function LoadStops({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const current = currentStop(load.stops);

    return (
        <Panel label={LOAD_COPY.stops.label} aside={<span className="haulr-label text-text-muted">{load.stops.length}</span>}>
            <ol className="flex flex-col">
                {load.stops.map((stop, index) => (
                    <LoadStop key={stop.id} stop={stop} current={stop.id === current?.id} last={index === load.stops.length - 1} />
                ))}
            </ol>
        </Panel>
    );
}
