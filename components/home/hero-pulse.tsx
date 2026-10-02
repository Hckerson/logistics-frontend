import { HERO_PULSE } from "@/lib/data/home/hero";

export default function HeroPulse() {
    return (
        <dl className="border-border absolute inset-x-0 bottom-8 hidden items-end gap-10 border-t pt-5 lg:flex motion-reduce:static">
            {HERO_PULSE.readouts.map((readout) => (
                <div key={readout.id} className="flex flex-col-reverse gap-1">
                    <dt className="haulr-label text-text-muted">{readout.label}</dt>
                    <dd className="text-text font-mono text-2xl tabular-nums">{readout.value}</dd>
                </div>
            ))}
            <p className="haulr-label text-text-muted ml-auto flex items-center gap-2">
                <span aria-hidden className="bg-accent block size-1.5 animate-pulse rounded-full" />
                {HERO_PULSE.note}
            </p>
        </dl>
    );
}
