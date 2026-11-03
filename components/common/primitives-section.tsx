import { useId, type ReactNode } from "react";
import HudCorners from "@/components/ui/hud-corners";

interface Props {
    index: string;
    title: string;
    note: string;
    children: ReactNode;
}

export default function PrimitivesSection({ index, title, note, children }: Props) {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId} className="border-border bg-background relative border">
            <HudCorners />
            <header className="border-border flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
                <div className="flex items-baseline gap-3">
                    <span className="haulr-label text-accent">{index}</span>
                    <h2 id={headingId} className="text-text text-sm font-medium">
                        {title}
                    </h2>
                </div>
                <p className="text-text-muted text-xs">{note}</p>
            </header>
            <div className="bg-border-light grid gap-px sm:grid-cols-2 xl:grid-cols-3">{children}</div>
        </section>
    );
}
