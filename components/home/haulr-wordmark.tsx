import Link from "next/link";
import { HAULR_BRAND } from "@/lib/data/home/brand";

export default function HaulrWordmark() {
    return (
        <Link
            href={HAULR_BRAND.home}
            className="text-text focus-visible:outline-text flex items-center gap-2 text-xl font-semibold tracking-tight uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ fontStretch: "var(--haulr-wide)" }}
        >
            <span aria-hidden className="bg-accent block size-2.5 rounded-full" />
            {HAULR_BRAND.name}
        </Link>
    );
}
