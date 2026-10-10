"use client";
import BoardCells from "@/components/common/board-cells";
import { useAssembly } from "@/components/providers/assembly-provider";
import { useBoardNoise } from "@/lib/hooks/use-board-noise";

interface Props {
    code: string;
}

export default function StatusBoard({ code }: Props) {
    const glyphs = code.split("");
    const noise = useBoardNoise(glyphs.length, useAssembly());

    return (
        <div className="w-36">
            <BoardCells glyphs={glyphs} caret={null} ghost={false} noise={noise} error={false} tall />
        </div>
    );
}
