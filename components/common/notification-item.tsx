"use client";
import clsx from "clsx";
import Link from "next/link";
import { appRoutes } from "@/lib/app-routes";
import type { NotificationDto } from "@/lib/contract/schemas";
import { NOTIFICATION_COPY as copy } from "@/lib/data/notifications";
import { useSession } from "@/components/providers/session-provider";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { useMarkRead } from "@/lib/hooks/use-notifications";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { FOCUS_RING } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    notification: NotificationDto;
    now: number | null;
    onOpen: () => void;
}

const ROW = "flex gap-2.5 px-3 py-2.5 text-xs transition-colors";

export default function NotificationItem({ notification, now, onOpen }: Props) {
    const { id, event, loadId, exportId, createdAt, readAt } = notification;
    const markRead = useMarkRead();
    const unread = readAt === null;
    const text = fillTemplate(copy.events[event], { reference: loadId ?? copy.noLoad });
    const age = now === null ? null : ageOf(minutesSince(createdAt, now));
    const driver = hasAnyRole(useSession()?.roles ?? [], ROLE_GROUPS.driver);
    const href = loadId ? (driver ? appRoutes.driverTrip(loadId) : appRoutes.load(loadId)) : exportId ? `${appRoutes.shipments()}${queryString({ export: exportId })}` : null;

    const open = () => {
        if (unread) markRead.mutate(id);
        onOpen();
    };

    const body = (
        <>
            <span aria-hidden className={clsx("mt-1.5 size-1.5 shrink-0 rounded-full", unread ? "bg-accent" : "bg-border-dark")} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={unread ? "text-text" : "text-text-secondary"}>{text}</span>
                <span className="text-text-muted">
                    {unread ? `${copy.unreadTag} · ` : ""}
                    {age}
                </span>
            </span>
        </>
    );

    return (
        <li className="border-border border-b last:border-b-0">
            {href ? (
                <Link href={href} onClick={open} className={clsx(ROW, "hover:bg-background-muted", FOCUS_RING)}>
                    {body}
                </Link>
            ) : (
                <div className={ROW}>{body}</div>
            )}
        </li>
    );
}
