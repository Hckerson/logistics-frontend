import clsx from "clsx";
import Link from "next/link";
import { HAULR_BRAND } from "@/lib/data/home/brand";

interface Props {
    compact?: boolean;
}

export default function HaulrWordmark({ compact = false }: Props) {
    return (
        <Link
            href={HAULR_BRAND.home}
            className={clsx(
                "text-text focus-visible:outline-text flex items-center gap-2 font-semibold tracking-tight uppercase focus-visible:outline-2 focus-visible:outline-offset-4",
                compact ? "text-base" : "text-xl",
            )}
            style={{ fontStretch: "var(--haulr-wide)" }}
        >
            <span aria-hidden className="bg-accent block size-2.5 rounded-full" />
            {HAULR_BRAND.name}
        </Link>
    );
}
