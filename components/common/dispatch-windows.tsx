"use client";
import DispatchWindow from "@/components/common/dispatch-window";
import CountBadge from "@/components/ui/count-badge";
import Panel from "@/components/ui/panel";
import type { FleetPlanDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    plan: FleetPlanDto;
    back: string;
}

const { windows: copy, counts } = FLEET_COPY;

export default function DispatchWindows({ plan, back }: Props) {
    const windows = plan.rows
        .flatMap(({ truck, windows: open }) => open.map((window) => ({ truck, window })))
        .sort((one, other) => Date.parse(one.window.from) - Date.parse(other.window.from));

    return (
        <Panel label={copy.label} aside={windows.length > 0 ? <CountBadge value={windows.length} tone="muted" label={pluralize(windows.length, counts.windows)} /> : null}>
            {windows.length === 0 ? (
                <p className="text-text-secondary text-xs">{copy.none}</p>
            ) : (
                <ul className="grid gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                    {windows.map(({ truck, window }) => (
                        <DispatchWindow key={window.id} window={window} truck={truck} timeZone={plan.timeZone} back={back} />
                    ))}
                </ul>
            )}
        </Panel>
    );
}
