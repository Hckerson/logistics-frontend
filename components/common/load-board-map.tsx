"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import HudCorners from "@/components/ui/hud-corners";
import { appRoutes } from "@/lib/app-routes";
import type { LoadBoardItemDto, LoadBoardPageDto } from "@/lib/contract/schemas";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import type { CollectionVehicle, MapStop } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";

const FreightMap = dynamic(() => import("@/components/common/freight-map"), {
    ssr: false,
    loading: () => <span className="bg-background-muted/40 block size-full animate-pulse" />,
});

interface Props {
    items: readonly LoadBoardItemDto[];
    origin: LoadBoardPageDto["origin"];
}

const { map: copy } = LOAD_BOARD_COPY;

export default function LoadBoardMap({ items, origin }: Props) {
    const router = useRouter();
    const pickups = useMemo(
        (): CollectionVehicle[] =>
            items.map((item) => ({
                id: item.loadId,
                position: [item.origin.longitude, item.origin.latitude],
                label: fillTemplate(copy.pick, { load: item.loadId, origin: item.origin.city, destination: item.destination.city, pay: formatMoney(item.carrierPayCents, item.currency) }),
                stale: false,
                late: false,
            })),
        [items],
    );
    const searched = useMemo((): MapStop[] => (origin ? [{ position: [origin.longitude, origin.latitude], type: "pickup", done: false }] : []), [origin]);

    return (
        <section aria-label={fillTemplate(copy.label, { count: String(items.length) })} className="border-border-dark relative h-[60svh] min-h-80 border">
            <FreightMap
                label={fillTemplate(copy.label, { count: String(items.length) })}
                recentreLabel={copy.recentre}
                precision="city"
                stops={searched}
                vehicles={pickups}
                onSelect={(loadId) => router.push(appRoutes.bookLoad(loadId))}
            />
            <HudCorners />
        </section>
    );
}
