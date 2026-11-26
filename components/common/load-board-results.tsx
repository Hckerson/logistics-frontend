import clsx from "clsx";
import LoadBoardRow from "@/components/common/load-board-row";
import Button from "@/components/ui/button";
import type { LoadBoardItemDto } from "@/lib/contract/schemas";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";

interface Props {
    items: readonly LoadBoardItemDto[];
    more: boolean;
    pending: boolean;
    back: string | null;
    onMore: () => void;
}

const { results: copy } = LOAD_BOARD_COPY;
const GRID = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 sm:grid-cols-[minmax(0,2.2fr)_1fr_auto] lg:grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.7fr_auto]";

export default function LoadBoardResults({ items, more, pending, back, onMore }: Props) {
    return (
        <div className="flex flex-col">
            <div aria-hidden className={clsx(GRID, "haulr-label text-text-muted border-border border-b pb-2")}>
                <span>{copy.columns.lane}</span>
                <span className="hidden sm:block">{copy.columns.pickup}</span>
                <span className="hidden lg:block">{copy.columns.equipment}</span>
                <span className="hidden lg:block">{copy.columns.deadhead}</span>
                <span className="text-right">
                    {copy.columns.pay} · {copy.columns.rpm}
                </span>
            </div>
            <ul aria-label={copy.label} aria-busy={pending || undefined}>
                {items.map((item) => (
                    <LoadBoardRow key={item.loadId} item={item} grid={GRID} back={back} />
                ))}
            </ul>
            {more ? (
                <Button tone="outline" className="mt-4 self-center" pending={pending} onPress={onMore}>
                    {copy.more}
                </Button>
            ) : null}
        </div>
    );
}
