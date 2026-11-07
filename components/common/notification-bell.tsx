"use client";
import { useEffect, useRef, useState } from "react";
import { Notification } from "@carbon/icons-react";
import { Dialog as AriaDialog, DialogTrigger } from "react-aria-components";
import NotificationList from "@/components/common/notification-list";
import CountBadge from "@/components/ui/count-badge";
import IconButton from "@/components/ui/icon-button";
import Popover from "@/components/ui/popover";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { TIME_MS } from "@/lib/constants";
import { NOTIFICATION_COPY as copy } from "@/lib/data/notifications";
import { useUnreadCount } from "@/lib/hooks/use-notifications";
import { pluralize } from "@/lib/utils/plural";

export default function NotificationBell() {
    const count = useUnreadCount().data?.count ?? null;
    const announce = useAnnounce();
    const [open, setOpen] = useState(false);
    const heard = useRef<{ count: number | null; at: number }>({ count: null, at: 0 });

    useEffect(() => {
        if (count === null) return;
        const prior = heard.current;
        const now = new Date().getTime();
        const louder = prior.count !== null && count > prior.count && now - prior.at >= TIME_MS.minute;
        if (louder) announce({ message: pluralize(count - (prior.count ?? 0), copy.arrived) });
        heard.current = { count, at: louder ? now : prior.at };
    }, [count, announce]);

    return (
        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
            <span className="relative inline-flex">
                <IconButton label={count ? pluralize(count, copy.unread) : copy.label} icon={Notification} size="sm" />
                {count ? (
                    <span aria-hidden className="pointer-events-none absolute -top-1 -right-1">
                        <CountBadge value={count} />
                    </span>
                ) : null}
            </span>
            <Popover placement="bottom end" className="w-80 max-w-[calc(100vw-2rem)]">
                <AriaDialog aria-label={copy.label} className="outline-none">
                    <NotificationList onOpen={() => setOpen(false)} />
                </AriaDialog>
            </Popover>
        </DialogTrigger>
    );
}
