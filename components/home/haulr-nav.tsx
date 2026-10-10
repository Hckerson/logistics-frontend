import Link from "next/link";
import HaulrButton from "@/components/home/haulr-button";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import SideSwitch from "@/components/home/side-switch";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { accessLink } from "@/lib/home/access";

interface Props {
    signedIn: boolean;
}

export default function HaulrNav({ signedIn }: Props) {
    const access = accessLink(signedIn);

    return (
        <header className="border-border bg-background fixed inset-x-0 top-0 z-(--z-indices-fixed) border-b">
            <div className="haulr-shell flex h-(--haulr-header) items-center gap-4 sm:gap-8">
                <HaulrWordmark />
                <SideSwitch />
                <p className="haulr-label text-text-muted hidden xl:block">{HAULR_BRAND.tag}</p>
                <nav aria-label={HAULR_BRAND.navLabel} className="ml-auto flex items-center gap-5">
                    <Link
                        href={access.href}
                        className="text-text-secondary hover:text-text hidden text-sm transition-colors sm:inline"
                    >
                        {access.label}
                    </Link>
                    <span className="hidden sm:block">
                        <HaulrButton href={HAULR_BRAND.price.href} size="sm">
                            {HAULR_BRAND.price.label}
                        </HaulrButton>
                    </span>
                </nav>
            </div>
        </header>
    );
}
