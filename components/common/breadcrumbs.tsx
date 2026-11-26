import clsx from "clsx";
import Link from "next/link";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { Crumb } from "@/lib/types";
import { UI_COPY } from "@/lib/ui/copy";

interface Props {
    trail: readonly Crumb[];
    current: string;
    mono?: boolean;
}

export default function Breadcrumbs({ trail, current, mono = false }: Props) {
    return (
        <nav aria-label={UI_COPY.breadcrumb}>
            <ol className="text-text-muted flex flex-wrap items-center gap-x-2 text-xs">
                {trail.map(({ label, href }) => (
                    <li key={label} className="flex items-center gap-2">
                        {href ? (
                            <Link href={href} className={`${QUIET_LINK} inline-flex min-h-11 items-center`}>
                                {label}
                            </Link>
                        ) : (
                            <span className="inline-flex min-h-11 items-center">{label}</span>
                        )}
                        <span aria-hidden>/</span>
                    </li>
                ))}
                <li aria-current="page" className={clsx("text-text inline-flex min-h-11 items-center", mono && "font-mono")}>
                    {current}
                </li>
            </ol>
        </nav>
    );
}
