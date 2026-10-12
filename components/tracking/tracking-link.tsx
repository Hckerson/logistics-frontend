import Link from "next/link";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { longDate } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    tracking: PublicTrackingDto;
}

const { link: copy } = TRACKING_COPY;

export default function TrackingLink({ tracking }: Props) {
    const zone = tracking.stops[tracking.stops.length - 1]?.timeZone ?? "UTC";
    const validity = tracking.expiresAt ? fillTemplate(copy.until, { date: longDate(tracking.expiresAt, zone) }) : copy.live;

    return (
        <div className="border-border flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-text-muted text-xs">
                {fillTemplate(copy.shared, { sharedBy: tracking.sharedBy })} {validity}
            </p>
            <nav aria-label={copy.convert} className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="haulr-label text-text-muted">{copy.convert}</span>
                {copy.links.map((link) => (
                    <Link key={link.id} href={link.href} className={QUIET_LINK}>
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
