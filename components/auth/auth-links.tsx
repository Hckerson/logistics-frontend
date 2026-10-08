import Link from "next/link";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { AuthLink } from "@/lib/types";

interface Props {
    label: string;
    links: readonly AuthLink[];
}

export default function AuthLinks({ label, links }: Props) {
    return (
        <nav aria-label={label} className="border-border border-t px-5 pt-4 pb-8">
            <ul className="flex flex-wrap justify-between gap-x-4 gap-y-2">
                {links.map((link) => (
                    <li key={link.id}>
                        <Link href={link.href} className={QUIET_LINK}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
