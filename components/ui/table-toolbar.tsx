import clsx from "clsx";
import type { ReactNode } from "react";
import TableBulkBar from "@/components/ui/table-bulk-bar";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    caption: string;
    count?: number;
    note?: ReactNode;
    tools?: ReactNode;
    picked: number;
    onClear: () => void;
    actions?: ReactNode;
}

export const TABLE_STRIP = "border-border flex min-h-11 items-center justify-between gap-4 border-b px-4 py-1.5";

export default function TableToolbar({ caption, count, note, tools, picked, onClear, actions }: Props) {
    return (
        <div className={clsx(TABLE_STRIP, "transition-colors", picked > 0 && "bg-background-muted/60")}>
            {picked > 0 ? (
                <TableBulkBar count={picked} onClear={onClear}>
                    {actions}
                </TableBulkBar>
            ) : (
                <>
                    <p aria-hidden className="flex min-w-0 items-baseline gap-2.5">
                        <span className="text-text truncate text-xs font-medium">{caption}</span>
                        {count === undefined ? null : (
                            <span key={count} className="text-text-muted haulr-flip font-mono text-xs tabular-nums">
                                {grouped(count)}
                            </span>
                        )}
                        {note ? <span className="haulr-label text-text-muted hidden sm:inline">{note}</span> : null}
                    </p>
                    {tools ? <div className="flex shrink-0 items-center gap-2">{tools}</div> : null}
                </>
            )}
        </div>
    );
}
