import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    className?: string;
    children: ReactNode;
}

export default function PublicPage({ className, children }: Props) {
    return (
        <div
            className={clsx(
                "haulr-shell flex flex-col gap-10 pt-[calc(var(--haulr-header)+3rem)] pb-20 lg:gap-14 lg:pt-[calc(var(--haulr-header)+5rem)]",
                className,
            )}
        >
            {children}
        </div>
    );
}
