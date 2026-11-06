"use client";
import Link from "next/link";
import { useState } from "react";
import { Share } from "@carbon/icons-react";
import ReasonDialog from "@/components/common/reason-dialog";
import Button from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import IconButton from "@/components/ui/icon-button";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { appRoutes } from "@/lib/app-routes";
import { TIME_MS } from "@/lib/constants";
import type { LoadDto, TrackingLinkDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useRevokeTrackingLink } from "@/lib/hooks/use-tracking";
import { useNow } from "@/lib/hooks/use-now";
import { stopMoment } from "@/lib/loads/view";
import { longDate } from "@/lib/tracking/view";
import { failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    load: LoadDto;
    link: TrackingLinkDto;
    staff: boolean;
}

const { share: copy } = LOAD_RECORD_COPY;
const SCHEME = /^https?:\/\//;

export default function ShareLink({ load, link, staff }: Props) {
    const revoke = useRevokeTrackingLink(load.id);
    const announce = useAnnounce();
    const now = useNow();
    const [asking, setAsking] = useState(false);
    const path = appRoutes.tracking(link.token);
    const url = new URL(path, window.location.origin).href;
    const zone = load.stops[load.stops.length - 1].facility.timeZone;
    const days = link.expiresAt && now !== null ? Math.max(0, Math.ceil((Date.parse(link.expiresAt) - now) / TIME_MS.day)) : null;
    const canShare = typeof navigator.share === "function";

    const confirm = (reason: string | undefined) =>
        revoke.mutate(
            { linkId: link.id, reason },
            {
                onSuccess: () => {
                    setAsking(false);
                    announce({ message: copy.revoked });
                },
            },
        );

    return (
        <div className="flex flex-col gap-2">
            <div className="bg-background-muted flex items-center gap-1 py-1 pr-1 pl-3">
                <Link
                    href={path}
                    target="_blank"
                    aria-label={fillTemplate(copy.link, { reference: load.id })}
                    className="text-text hover:text-accent min-w-0 flex-1 truncate font-mono text-xs transition-colors"
                >
                    {url.replace(SCHEME, "")}
                </Link>
                <CopyButton value={url} label={copy.copy} done={copy.copied} />
                {canShare ? (
                    <IconButton label={copy.share} icon={Share} size="sm" onPress={() => void navigator.share({ title: load.id, url }).catch(() => undefined)} />
                ) : null}
            </div>
            <p className="text-text-muted text-xs">
                {link.expiresAt && days !== null
                    ? fillTemplate(copy.until, { date: longDate(link.expiresAt, zone), days: pluralize(days, copy.days) })
                    : copy.untilDelivery}
            </p>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-text-muted text-xs">{fillTemplate(copy.createdBy, { name: link.createdByName, time: stopMoment(link.createdAt, zone) })}</p>
                <Button tone="link" size="inline" onPress={() => setAsking(true)}>
                    {copy.revoke}
                </Button>
            </div>
            <ReasonDialog
                key={asking ? "open" : "closed"}
                isOpen={asking}
                kicker={load.id}
                title={copy.revokeTitle}
                consequence={copy.revokeConsequence}
                confirmLabel={copy.revoke}
                cancelLabel={copy.keep}
                needsReason={staff}
                pending={revoke.isPending}
                failure={revoke.isError ? failureFrom(revoke.error) : null}
                destructive
                onClose={() => setAsking(false)}
                onConfirm={confirm}
            />
        </div>
    );
}
