import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClass } from "@/lib/ui/classes";
import { ICON_SIZES } from "@/lib/ui/constants";
import type { ButtonSize, ButtonTone, IconGlyph } from "@/lib/types";

interface Props extends Omit<ComponentProps<typeof Link>, "className" | "children"> {
    tone?: ButtonTone;
    size?: ButtonSize;
    icon?: IconGlyph;
    trailing?: IconGlyph;
    className?: string;
    children: ReactNode;
}

export default function ButtonLink({ tone, size = "md", icon: Icon, trailing: Trailing, className, children, ...link }: Props) {
    return (
        <Link {...link} className={buttonClass(tone, size, className)}>
            {Icon ? <Icon aria-hidden className={clsx(ICON_SIZES[size], "shrink-0")} /> : null}
            <span>{children}</span>
            {Trailing ? (
                <Trailing
                    aria-hidden
                    className={clsx(ICON_SIZES[size], "shrink-0 transition-transform duration-300 group-hover:translate-x-0.5")}
                />
            ) : null}
        </Link>
    );
}
