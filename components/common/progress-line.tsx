import clsx from "clsx";

interface Props {
    value?: number;
    className?: string;
}

export default function ProgressLine({ value, className }: Props) {
    return (
        <span aria-hidden className={clsx("block h-0.5 overflow-hidden", className)}>
            {value === undefined ? (
                <span className="haulr-progress bg-accent block h-full w-1/3" />
            ) : (
                <span
                    className="bg-accent block h-full origin-left transition-transform duration-1000 ease-linear"
                    style={{ transform: `scaleX(${value})` }}
                />
            )}
        </span>
    );
}
