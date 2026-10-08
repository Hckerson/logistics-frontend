import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "accent" | "ink" | "ghost";
type Size = "sm" | "lg" | "xl";

interface Props {
    href: string;
    tone?: Tone;
    size?: Size;
    className?: string;
    children: ReactNode;
}

const tones: Record<Tone, string> = {
    accent: "bg-accent text-text-inverse hover:bg-accent-dark",
    ink: "bg-text text-text-inverse hover:bg-text-secondary",
    ghost: "border border-border-dark text-text hover:border-text",
};

const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-6 text-lg",
};

export const haulrButtonClass = (tone: Tone = "accent", size: Size = "lg", className?: string) =>
    clsx(
        "group inline-flex items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap transition-colors duration-300",
        "focus-visible:outline-text focus-visible:outline-2 focus-visible:outline-offset-2",
        tones[tone],
        sizes[size],
        className,
    );

export default function HaulrButton({ href, tone = "accent", size = "lg", className, children }: Props) {
    return (
        <Link href={href} className={haulrButtonClass(tone, size, className)}>
            {children}
        </Link>
    );
}
