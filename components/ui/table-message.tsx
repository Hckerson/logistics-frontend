import type { ReactNode } from "react";
import { Renew } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { TABLE_SKELETON_ROWS } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";

interface Props {
    loading: boolean;
    failed: boolean;
    empty?: ReactNode;
    onRetry?: () => void;
}

export default function TableMessage({ loading, failed, empty, onRetry }: Props) {
    if (loading) return <Skeleton lines={TABLE_SKELETON_ROWS} className="gap-4 px-4 py-4" />;

    if (failed) {
        return (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 px-4 py-6">
                <p className="text-text-secondary text-xs">{UI_COPY.tableFailed}</p>
                {onRetry ? (
                    <Button tone="outline" size="sm" icon={Renew} onPress={onRetry}>
                        {UI_COPY.retry}
                    </Button>
                ) : null}
            </div>
        );
    }

    return <div className="text-text-muted px-4 py-6 text-xs">{empty}</div>;
}
