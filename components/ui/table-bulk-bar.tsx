import type { ReactNode } from "react";
import Button from "@/components/ui/button";
import { UI_COPY } from "@/lib/ui/copy";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    count: number;
    onClear: () => void;
    children?: ReactNode;
}

export default function TableBulkBar({ count, onClear, children }: Props) {
    return (
        <div className="haulr-fade-in flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-text text-xs font-medium tabular-nums">{pluralize(count, UI_COPY.selectedCount)}</p>
            <div className="flex flex-wrap items-center gap-2">
                {children}
                <Button tone="ghost" size="sm" onPress={onClear}>
                    {UI_COPY.clearSelection}
                </Button>
            </div>
        </div>
    );
}
