import clsx from "clsx";

interface Props {
    lines?: number;
    className?: string;
}

export default function Skeleton({ lines, className }: Props) {
    const rows = Array.from({ length: lines ?? 1 }, (_, index) => index);
    const last = rows.length - 1;

    return (
        <span aria-hidden className={clsx("flex flex-col gap-2", className)}>
            {rows.map((row) => (
                <span
                    key={row}
                    className={clsx(
                        "bg-background-muted relative block overflow-hidden",
                        lines === undefined ? "h-full min-h-3" : "h-3",
                        lines !== undefined && row === last && last > 0 ? "w-3/5" : "w-full",
                    )}
                >
                    <span className="haulr-progress via-border/70 absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent to-transparent" />
                </span>
            ))}
        </span>
    );
}
