"use client";
import BoardCells from "@/components/common/board-cells";
import { useBoardNoise } from "@/lib/hooks/use-board-noise";
import { BOARD } from "@/lib/auth/constants";

interface Props {
    value: string;
    tall?: boolean;
}

export default function BoardReadout({ value, tall = true }: Props) {
    const glyphs = value.split("");
    const noise = useBoardNoise(glyphs.length, 0);

    return (
        <div aria-hidden className="w-full" style={{ maxWidth: `${glyphs.length * (tall ? BOARD.readoutRem : BOARD.compactRem)}rem` }}>
            <BoardCells glyphs={glyphs} caret={null} ghost={false} noise={noise} error={false} tall={tall} />
        </div>
    );
}
