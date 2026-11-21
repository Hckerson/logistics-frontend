"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useOfflineQueue } from "@/lib/hooks/use-offline-queue";
import { offlineQueue } from "@/lib/utils/offline-queue";

interface Props {
    loadId?: string;
}

const { sync: copy } = DRIVER_COPY;

export default function DriverSync({ loadId }: Props) {
    const queue = useOfflineQueue();
    const [discarding, setDiscarding] = useState(false);
    const entries = queue.entries.filter((entry) => !loadId || entry.loadId === loadId);
    const review = entries.filter((entry) => entry.failure);
    const stuck = queue.failure && entries.some((entry) => !entry.failure) ? queue.failure : null;

    if (review.length === 0 && queue.notices.length === 0 && !stuck) return null;

    const discard = async () => {
        if (queue.owner) await offlineQueue.discard(queue.owner);
        setDiscarding(false);
    };

    return (
        <section aria-label={copy.label} className="border-signal-warning flex flex-col gap-2 border-l-2 py-1 pl-3 text-xs">
            {stuck ? <p className="text-signal-warning">{stuck}</p> : null}
            {review.map((entry) => (
                <p key={entry.id} className="text-error">
                    {copy.review}: {entry.failure}
                </p>
            ))}
            {queue.notices.map((notice) => (
                <p key={notice} className="text-text-secondary">
                    {notice}
                </p>
            ))}
            <span className="flex flex-wrap items-center gap-4">
                {queue.notices.length > 0 ? (
                    <Button tone="link" size="inline" onPress={offlineQueue.dismiss} className="min-h-11">
                        {copy.dismiss}
                    </Button>
                ) : null}
                {entries.length > 0 ? (
                    <Button tone="link" size="inline" onPress={() => setDiscarding(true)} className="min-h-11">
                        {copy.discard}
                    </Button>
                ) : null}
            </span>
            <ConfirmDialog
                isOpen={discarding}
                onOpenChange={setDiscarding}
                title={copy.discardTitle}
                consequence={copy.discardBody}
                confirmLabel={copy.discardConfirm}
                cancelLabel={copy.keep}
                onConfirm={() => void discard()}
                destructive
            />
        </section>
    );
}
