import clsx from "clsx";
import Link from "next/link";
import LaneLabel from "@/components/common/lane-label";
import { appRoutes } from "@/lib/app-routes";
import type { LoadBoardItemDto } from "@/lib/contract/schemas";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { withBack } from "@/lib/navigation/back";
import { dayName, shortTime } from "@/lib/tracking/view";
import { FOCUS_RING } from "@/lib/ui/constants";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    item: LoadBoardItemDto;
    grid: string;
    back: string | null;
}

const { results: copy } = LOAD_BOARD_COPY;

export default function LoadBoardRow({ item, grid, back }: Props) {
    const pay = formatMoney(item.carrierPayCents, item.currency);
    const rpm = formatMoney(item.ratePerMileCents, item.currency);
    const pickup = `${dayName(item.pickupStart, item.timeZone)} ${shortTime(item.pickupStart, item.timeZone)}`;
    const equipment = LOAD_COPY.equipment[item.equipment];
    const href = withBack(appRoutes.bookLoad(item.loadId), back);

    return (
        <li className="border-border border-b">
            <Link
                href={href}
                aria-label={fillTemplate(copy.row, {
                    origin: `${item.origin.city}, ${item.origin.region}`,
                    destination: `${item.destination.city}, ${item.destination.region}`,
                    pickup,
                    equipment,
                    weight: grouped(item.weightLb),
                    pay,
                    rpm,
                    deadhead: item.deadheadMiles === null ? "" : fillTemplate(copy.deadhead, { miles: grouped(item.deadheadMiles) }),
                })}
                className={clsx(grid, "group hover:bg-background-muted/60 min-h-16 py-3 transition-colors", FOCUS_RING)}
            >
                <span className="flex min-w-0 flex-col gap-1">
                    <span className="haulr-lane truncate text-lg tracking-tight">
                        <LaneLabel origin={item.origin.city} destination={item.destination.city} />
                    </span>
                    <span className="text-text-muted truncate font-mono text-xs">
                        {item.loadId} · {grouped(item.miles)} mi · {item.commodity}
                    </span>
                </span>
                <span className="text-text-secondary hidden text-sm sm:block">{pickup}</span>
                <span className="text-text-secondary hidden text-sm lg:block">
                    {equipment}
                    {item.tempMinF !== null && item.tempMaxF !== null ? <span className="text-text-muted block text-xs">{fillTemplate(copy.temperature, { min: String(item.tempMinF), max: String(item.tempMaxF) })}</span> : null}
                </span>
                <span className="text-text-secondary hidden font-mono text-sm tabular-nums lg:block">
                    {item.deadheadMiles === null ? "" : fillTemplate(copy.deadheadShort, { miles: grouped(item.deadheadMiles) })}
                </span>
                <span className="flex flex-col items-end gap-0.5">
                    <span className="text-text font-mono text-base tabular-nums">{pay}</span>
                    <span className="text-accent font-mono text-xs tabular-nums">{rpm}</span>
                    <span className="text-text-muted text-xs sm:hidden">{pickup}</span>
                </span>
            </Link>
        </li>
    );
}
