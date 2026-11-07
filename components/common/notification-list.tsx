"use client";
import NotificationItem from "@/components/common/notification-item";
import SectionFailure from "@/components/common/section-failure";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { NOTIFICATION_COPY as copy } from "@/lib/data/notifications";
import { useMarkAllRead, useNotifications, useUnreadCount } from "@/lib/hooks/use-notifications";
import { useNow } from "@/lib/hooks/use-now";
import { NOTIFICATION_PREVIEW } from "@/lib/loads/constants";
import { failureFrom } from "@/lib/utils/action-result";

interface Props {
    onOpen: () => void;
}

export default function NotificationList({ onOpen }: Props) {
    const list = useNotifications();
    const unread = useUnreadCount().data?.count ?? 0;
    const markAll = useMarkAllRead();
    const now = useNow();
    const items = list.data?.pages[0]?.items.slice(0, NOTIFICATION_PREVIEW) ?? [];

    return (
        <div className="flex flex-col">
            <div className="border-border flex min-h-10 items-center justify-between gap-3 border-b px-3">
                <p className="haulr-label text-text-muted">{copy.label}</p>
                {unread > 0 ? (
                    <Button tone="link" size="inline" pending={markAll.isPending} pendingLabel={copy.marking} onPress={() => markAll.mutate()}>
                        {copy.markAll}
                    </Button>
                ) : null}
            </div>
            {list.isPending ? <Skeleton lines={3} className="p-3" /> : null}
            {list.isError ? (
                <div className="p-3">
                    <SectionFailure label={copy.label} failure={failureFrom(list.error)} onRetry={() => list.refetch()} />
                </div>
            ) : null}
            {list.isSuccess && items.length === 0 ? <p className="text-text-muted p-3 text-xs">{copy.empty}</p> : null}
            {items.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto">
                    {items.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} now={now} onOpen={onOpen} />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
