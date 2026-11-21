"use client";
import Button from "@/components/ui/button";
import StatusLabel from "@/components/ui/status-label";
import { useReplay } from "@/components/providers/offline-queue-provider";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useOfflineQueue } from "@/lib/hooks/use-offline-queue";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    loadId?: string;
}

const { sync: copy } = DRIVER_COPY;

export default function DriverStatusLine({ loadId }: Props) {
    const queue = useOfflineQueue();
    const replay = useReplay();
    const waiting = queue.entries.filter((entry) => !entry.failure && (!loadId || entry.loadId === loadId));

    if (queue.syncing) return <StatusLabel label={copy.sending} tone="live" pulse />;
    if (waiting.length === 0) return <StatusLabel label={copy.sent} tone="success" />;

    return (
        <span role="status" className="flex items-center gap-3">
            <StatusLabel label={pluralize(waiting.length, copy.waiting)} tone="warning" />
            <Button tone="link" size="inline" onPress={() => void replay()} className="min-h-11">
                {copy.retry}
            </Button>
        </span>
    );
}
