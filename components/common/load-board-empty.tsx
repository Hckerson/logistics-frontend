import Button from "@/components/ui/button";
import { TIME_MS } from "@/lib/constants";
import { LOAD_BOARD_COPY } from "@/lib/data/load-board/copy";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { activeFilters } from "@/lib/load-board/search";
import type { LoadBoardQuery } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    query: LoadBoardQuery;
    onChange: (query: LoadBoardQuery) => void;
}

const { empty: copy } = LOAD_BOARD_COPY;
const DAY = 10;

const dayAfter = (value: string) => new Date(Date.parse(value.slice(0, DAY)) + LOAD_BOARD.widenDays * TIME_MS.day).toISOString().slice(0, DAY);

export default function LoadBoardEmpty({ query, onChange }: Props) {
    const radius = query.originRadius ?? LOAD_BOARD.radius.fallback;
    const wider = Math.min(radius + LOAD_BOARD.widenRadius, LOAD_BOARD.radius.max);
    const count = activeFilters(query);

    return (
        <div className="border-border flex flex-col gap-3 border-y py-8">
            <p className="text-text text-lg">{copy.title}</p>
            {count > 0 ? <p className="text-text-secondary text-xs">{pluralize(count, copy.filters)}</p> : null}
            <div className="flex flex-wrap gap-2">
                {query.origin && wider > radius ? (
                    <Button tone="outline" onPress={() => onChange({ ...query, originRadius: wider })}>
                        {fillTemplate(copy.widen, { miles: String(wider) })}
                    </Button>
                ) : null}
                {query.to ? (
                    <Button tone="outline" onPress={() => onChange({ ...query, to: query.to ? dayAfter(query.to) : undefined })}>
                        {copy.later}
                    </Button>
                ) : null}
                {count > 0 ? (
                    <Button tone="ghost" onPress={() => onChange({})}>
                        {copy.clear}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
