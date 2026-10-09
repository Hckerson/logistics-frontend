import clsx from "clsx";

interface Props {
    glyphs: readonly string[];
    caret: number | null;
    ghost: boolean;
    noise: readonly string[] | null;
    error: boolean;
    tall?: boolean;
}

export default function BoardCells({ glyphs, caret, ghost, noise, error, tall = false }: Props) {
    return (
        <span aria-hidden className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${glyphs.length}, minmax(0, 1fr))` }}>
            {glyphs.map((glyph, index) => {
                const churn = noise?.[index];
                const shown = churn || glyph;
                return (
                    <span
                        key={index}
                        className={clsx(
                            "relative flex items-center justify-center overflow-hidden font-mono transition-colors",
                            tall ? "h-14 text-xl" : "h-10 text-sm",
                            caret === index ? "bg-border-dark" : error ? "bg-error-light" : "bg-background-muted",
                            churn ? "text-accent" : ghost ? "text-text-muted/40" : "text-text",
                        )}
                    >
                        <span key={shown} className="haulr-flip">
                            {shown}
                        </span>
                        <span className="bg-background/70 absolute inset-x-0 top-1/2 h-px" />
                        {caret === index ? <span className="bg-accent absolute inset-x-1 bottom-1 h-0.5 animate-pulse" /> : null}
                    </span>
                );
            })}
        </span>
    );
}
