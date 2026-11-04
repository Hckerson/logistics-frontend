import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowsVertical } from "@carbon/icons-react";
import type { SortDirection } from "react-aria-components";

interface Props {
    label: string;
    sortable: boolean;
    direction: SortDirection | undefined;
    end: boolean;
}

export default function TableHeading({ label, sortable, direction, end }: Props) {
    const Glyph = direction === "descending" ? ArrowDown : direction === "ascending" ? ArrowUp : ArrowsVertical;

    return (
        <span className={clsx("inline-flex items-center gap-1.5", end && "flex-row-reverse", direction && "text-text-secondary")}>
            {label}
            {sortable ? (
                <Glyph
                    aria-hidden
                    className={clsx(
                        "size-3 shrink-0 transition-colors",
                        direction ? "text-accent" : "text-text-muted/50 group-hover/head:text-text-muted",
                    )}
                />
            ) : null}
        </span>
    );
}
