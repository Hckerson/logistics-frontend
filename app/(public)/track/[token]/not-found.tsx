import Link from "next/link";
import PageIntro from "@/components/common/page-intro";
import PublicPage from "@/components/common/public-page";
import { QUIET_LINK } from "@/lib/auth/constants";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";

const { missing, link } = TRACKING_COPY;

export default function TrackingNotFound() {
    return (
        <PublicPage>
            <PageIntro eyebrow={missing.eyebrow} title={missing.title} lead={missing.lead} />
            <nav aria-label={link.convert} className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="haulr-label text-text-muted">{link.convert}</span>
                {link.links.map((item) => (
                    <Link key={item.id} href={item.href} className={QUIET_LINK}>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </PublicPage>
    );
}
