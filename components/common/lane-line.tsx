import LaneRule from "@/components/common/lane-rule";

interface Props {
    origin: string;
    destination: string;
    progress: number;
    label: string;
}

export default function LaneLine({ origin, destination, progress, label }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <p className="sr-only">{label}</p>
            <div aria-hidden className="text-text haulr-lane flex items-baseline justify-between gap-4 text-2xl tracking-tight sm:text-3xl">
                <span className="min-w-0 truncate">{origin}</span>
                <span className="min-w-0 truncate text-right">{destination}</span>
            </div>
            <LaneRule at={progress} still className="w-full" />
        </div>
    );
}
