import Link from "next/link";
import FooterRoute from "@/components/home/footer-route";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { FOOTER_COPY, FOOTER_GROUPS } from "@/lib/data/home/footer";
import { accessLink } from "@/lib/home/access";
import { WORDMARK } from "@/lib/home/constants";
import { LOGIN_ROUTE } from "@/lib/constants";
import type { NavLinkItem } from "@/lib/types";

interface Props {
    signedIn: boolean;
}

export default function HaulrFooter({ signedIn }: Props) {
    const shown = (link: NavLinkItem) => (link.href === LOGIN_ROUTE ? { ...link, ...accessLink(signedIn) } : link);

    return (
        <footer className="overflow-hidden">
            <div className="haulr-shell flex flex-col gap-16 pt-14">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="flex flex-col gap-5 lg:col-span-5">
                        <HaulrWordmark />
                        <p className="text-text-muted max-w-sm text-sm">{FOOTER_COPY.statement}</p>
                    </div>
                    <nav
                        aria-label={FOOTER_COPY.navLabel}
                        className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7"
                    >
                        {FOOTER_GROUPS.map((group) => (
                            <div key={group.id} className="flex flex-col gap-4">
                                <p className="haulr-label text-text-muted">{group.label}</p>
                                <ul className="flex flex-col gap-3">
                                    {group.links.map(shown).map((link) => (
                                        <li key={link.id}>
                                            <Link
                                                href={link.href}
                                                className="text-text-secondary hover:text-text text-sm transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
                <FooterRoute />
                <svg aria-hidden viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`} className="w-full">
                    <text
                        x={WORDMARK.width / 2}
                        y={WORDMARK.baseline}
                        textAnchor="middle"
                        textLength={WORDMARK.width}
                        lengthAdjust="spacingAndGlyphs"
                        className="fill-background-muted font-display font-semibold uppercase"
                        style={{ fontSize: WORDMARK.size, fontStretch: "var(--haulr-wide)" }}
                    >
                        {HAULR_BRAND.name}
                    </text>
                </svg>
            </div>
        </footer>
    );
}
