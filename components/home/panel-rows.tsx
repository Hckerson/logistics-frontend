import type { SceneReadout } from "@/lib/types";

interface Props {
    rows: readonly SceneReadout[];
}

export default function PanelRows({ rows }: Props) {
    return (
        <dl className="flex flex-col gap-2.5">
            {rows.map((row) => (
                <div key={row.id} className="flex items-baseline justify-between gap-4 text-sm">
                    <dt className="text-text-muted">{row.label}</dt>
                    <dd className="text-text font-mono tabular-nums">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}
