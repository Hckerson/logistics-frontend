import Link from "next/link";
import { ArrowRight } from "@carbon/icons-react";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";

const { recovery } = SIGN_IN_COPY;

export default function RecoveryNav() {
    return (
        <nav aria-label={recovery.label} className="border-border flex flex-col gap-4 border-t pt-8">
            <p className="haulr-label text-text-muted">{recovery.label}</p>
            <ul className="flex flex-col">
                {recovery.links.map((link) => (
                    <li key={link.id}>
                        <Link
                            href={link.href}
                            className="group text-text-secondary hover:text-text focus-visible:outline-text flex items-center justify-between py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            {link.label}
                            <ArrowRight
                                aria-hidden
                                className="text-text-muted group-hover:text-accent size-4 transition-[color,translate] group-hover:translate-x-0.5"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
