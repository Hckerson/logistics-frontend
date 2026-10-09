import Link from "next/link";
import { ASSEMBLY, QUIET_LINK } from "@/lib/auth/constants";
import { partAt } from "@/lib/auth/entry";
import type { AuthLink } from "@/lib/types";

interface Props {
    label: string;
    links: readonly AuthLink[];
}

export default function AuthLinks({ label, links }: Props) {
    return (
        <nav
            aria-label={label}
            style={partAt(ASSEMBLY.footer)}
            className="haulr-part border-border relative border-t px-5 pt-4 pb-8 [--haulr-part-y:0.75rem]"
        >
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
