import Link from "next/link";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import LaneRule from "@/components/home/lane-rule";
import { FOOTER_COPY, FOOTER_GROUPS } from "@/lib/data/home/footer";

export default function HaulrFooter() {
    return (
        <footer className="border-border border-t">
            <div className="haulr-shell flex flex-col gap-12 py-14">
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
                                    {group.links.map((link) => (
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
                <LaneRule state="settled" className="w-full" />
            </div>
        </footer>
    );
}
