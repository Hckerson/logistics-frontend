import clsx from "clsx";

type Tone = "muted" | "accent" | "error";

interface Props {
    tone?: Tone;
    className?: string;
}

const TONES: Record<Tone, string> = {
    muted: "border-text-muted",
    accent: "border-accent",
    error: "border-error",
};

const CORNERS = [
    "-top-px -left-px border-t border-l [--haulr-snap-x:-2.5rem] [--haulr-snap-y:-2.5rem]",
    "-top-px -right-px border-t border-r [--haulr-snap-x:2.5rem] [--haulr-snap-y:-2.5rem]",
    "-bottom-px -left-px border-b border-l [--haulr-snap-x:-2.5rem] [--haulr-snap-y:2.5rem]",
    "-right-px -bottom-px border-r border-b [--haulr-snap-x:2.5rem] [--haulr-snap-y:2.5rem]",
];

export default function HudCorners({ tone = "muted", className }: Props) {
    return (
        <span aria-hidden>
            {CORNERS.map((corner) => (
                <span key={corner} className={clsx("absolute block size-3", TONES[tone], corner, className)} />
            ))}
        </span>
    );
}
