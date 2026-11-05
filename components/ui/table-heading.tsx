import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowsVertical } from "@carbon/icons-react";
import { FOCUS_RING } from "@/lib/ui/constants";
import type { TableSort } from "@/lib/types";

interface Props {
    label: string;
    direction: TableSort["direction"] | undefined;
    end: boolean;
    onSort?: () => void;
}

export default function TableHeading({ label, direction, end, onSort }: Props) {
    if (!onSort) return <span>{label}</span>;

    const Glyph = direction === "descending" ? ArrowDown : direction === "ascending" ? ArrowUp : ArrowsVertical;

    return (
        <button
            type="button"
            onClick={onSort}
            className={clsx(
                "group/sort hover:text-text-secondary inline-flex cursor-pointer items-center gap-1.5 uppercase transition-colors",
                end && "flex-row-reverse",
                direction && "text-text-secondary",
                FOCUS_RING,
            )}
        >
            {label}
            <Glyph
                aria-hidden
                className={clsx(
                    "size-3 shrink-0 transition-colors",
                    direction ? "text-accent" : "text-text-muted/50 group-hover/sort:text-text-muted",
                )}
            />
        </button>
    );
}
