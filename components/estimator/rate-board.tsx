"use client";
import BoardCells from "@/components/common/board-cells";
import { useBoardNoise } from "@/lib/hooks/use-board-noise";
import { RATE_CELL_REM } from "@/lib/quotes/constants";

interface Props {
    value: string;
}

export default function RateBoard({ value }: Props) {
    const glyphs = value.split("");
    const noise = useBoardNoise(glyphs.length, 0);

    return (
        <div aria-hidden className="w-full" style={{ maxWidth: `${glyphs.length * RATE_CELL_REM}rem` }}>
            <BoardCells glyphs={glyphs} caret={null} ghost={false} noise={noise} error={false} tall />
        </div>
    );
}
