"use client";
import LoadBoardResults from "@/components/common/load-board-results";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { useLoadBoard } from "@/lib/hooks/use-load-board";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import type { LoadBoardQuery } from "@/lib/types";

interface Props {
    loadId: string;
    query: LoadBoardQuery;
}

const { outcome: copy } = BOOKING_COPY;

export default function BookSimilar({ loadId, query }: Props) {
    const similar = useLoadBoard({ ...query, limit: LOAD_BOARD.similarLimit + 1 });
    const items = (similar.data?.items ?? []).filter((item) => item.loadId !== loadId).slice(0, LOAD_BOARD.similarLimit);

    if (similar.isPending) return null;

    return (
        <section className="flex flex-col gap-2">
            <h2 className="haulr-label text-text-muted">{copy.similar}</h2>
            {items.length === 0 ? <p className="text-text-secondary text-xs">{copy.noSimilar}</p> : <LoadBoardResults items={items} more={false} pending={false} back={null} onMore={() => undefined} />}
        </section>
    );
}
