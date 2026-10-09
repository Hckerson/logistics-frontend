import Link from "next/link";
import { ArrowRight } from "@carbon/icons-react";
import { CONSOLE_ACTION } from "@/lib/auth/constants";

interface Props {
    href: string;
    label: string;
}

export default function ConsoleLink({ href, label }: Props) {
    return (
        <Link href={href} className={CONSOLE_ACTION}>
            {label}
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
    );
}
