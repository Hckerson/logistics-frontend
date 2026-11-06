import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    actions: ReactNode;
    coverage: ReactNode;
    tracking: ReactNode;
    share: ReactNode;
    stops: ReactNode;
    money: ReactNode;
    documents: ReactNode;
    timeline: ReactNode;
}

const SLOT = "flex flex-col gap-4 empty:hidden";
const COLUMN = "contents lg:flex lg:min-w-0 lg:flex-col lg:gap-4";

export default function LoadSections({ actions, coverage, tracking, share, stops, money, documents, timeline }: Props) {
    return (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div className={COLUMN}>
                <div className={clsx(SLOT, "order-3")}>{tracking}</div>
                <div className={clsx(SLOT, "order-8")}>{timeline}</div>
            </div>
            <div className={COLUMN}>
                <div className={clsx(SLOT, "order-1")}>{actions}</div>
                <div className={clsx(SLOT, "order-2")}>{coverage}</div>
                <div className={clsx(SLOT, "order-4")}>{share}</div>
                <div className={clsx(SLOT, "order-5")}>{stops}</div>
                <div className={clsx(SLOT, "order-6")}>{money}</div>
                <div className={clsx(SLOT, "order-7")}>{documents}</div>
            </div>
        </div>
    );
}
