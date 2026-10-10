import { SUPPORT_HOURS } from "@/lib/data/support/copy";

export default function SupportHours() {
    return (
        <div className="flex flex-col gap-3">
            <p className="haulr-label text-text-muted">{SUPPORT_HOURS.label}</p>
            <dl className="flex flex-col gap-2">
                {SUPPORT_HOURS.lines.map((line) => (
                    <div key={line.id} className="flex flex-col gap-0.5">
                        <dt className="text-text-muted text-xs">{line.label}</dt>
                        <dd className="text-text font-mono text-xs">{line.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
