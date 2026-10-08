import clsx from "clsx";
import type { NetworkHub } from "@/lib/types";

interface Props {
    label: string;
    hub: NetworkHub | undefined;
    ghost: NetworkHub | undefined;
    align: "start" | "end";
}

export default function TicketEnd({ label, hub, ghost, align }: Props) {
    const shown = hub ?? ghost;

    return (
        <div className={clsx("flex shrink-0 flex-col gap-3", align === "end" && "items-end text-right")}>
            <p className="haulr-label text-text-muted">{label}</p>
            <p className={clsx("haulr-display transition-colors duration-500", hub ? "text-text" : "text-border-dark")}>
                {shown?.code}
            </p>
            <p className={clsx("text-sm transition-colors duration-500", hub ? "text-text-secondary" : "text-text-muted")}>
                {shown?.name}
            </p>
        </div>
    );
}
