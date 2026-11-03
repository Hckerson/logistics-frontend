import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    label: string;
    contract?: string;
    wide?: boolean;
    children: ReactNode;
}

export default function PrimitivesSpecimen({ label, contract, wide = false, children }: Props) {
    return (
        <div className={clsx("bg-background flex min-w-0 flex-col gap-3 p-4", wide && "sm:col-span-2 xl:col-span-3")}>
            <p className="haulr-label text-text-muted flex items-baseline justify-between gap-3">
                <span>{label}</span>
                {contract ? <span className="text-text-muted/60">{contract}</span> : null}
            </p>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}
