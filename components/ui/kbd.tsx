import clsx from "clsx";

interface Props {
    keys: readonly string[];
    announce?: boolean;
    className?: string;
}

export default function Kbd({ keys, announce = false, className }: Props) {
    return (
        <span aria-hidden={announce ? undefined : true} className={clsx("inline-flex shrink-0 items-center gap-0.5", className)}>
            {keys.map((key) => (
                <kbd
                    key={key}
                    className="border-border-dark text-text-muted grid h-5 min-w-5 place-items-center border px-1 font-mono text-[0.625rem] leading-none"
                >
                    {key}
                </kbd>
            ))}
        </span>
    );
}
