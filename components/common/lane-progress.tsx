import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import { share } from "@/lib/utils/format-number";

interface Props {
    from: string;
    to: string;
    progress: number;
}

export default function LaneProgress({ from, to, progress }: Props) {
    const done = Math.min(Math.max(progress, 0), 1);
    const percent = share(done);
    const at = `${done * 100}%`;

    return (
        <div role="img" aria-label={fillTemplate(UI_COPY.routeProgress, { percent, from, to })} className="flex items-center gap-3">
            <span aria-hidden className="haulr-label text-text">
                {from}
            </span>
            <span aria-hidden className="bg-border-dark relative h-0.5 flex-1">
                <span className="bg-accent absolute inset-y-0 left-0" style={{ width: at }} />
                <span
                    className="bg-accent absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_4px_var(--haulr-glow)]"
                    style={{ left: at }}
                />
            </span>
            <span aria-hidden className="haulr-label text-text-muted">
                {to}
            </span>
            <span aria-hidden className="text-text w-10 text-right font-mono text-xs tabular-nums">
                {percent}
            </span>
        </div>
    );
}
