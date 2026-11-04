import type { ReactNode } from "react";

interface Props {
    actions: ReactNode;
    tracking: ReactNode;
    stops: ReactNode;
    money: ReactNode;
}

export default function LoadSections({ actions, tracking, stops, money }: Props) {
    return (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr]">
            <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">{actions}</div>
            <div className="flex flex-col gap-4 empty:hidden lg:col-start-1 lg:row-span-3 lg:row-start-1">{tracking}</div>
            <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2">{stops}</div>
            <div className="flex flex-col gap-4 empty:hidden lg:col-start-2 lg:row-start-3">{money}</div>
        </div>
    );
}
