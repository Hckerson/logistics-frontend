import { useMutation } from "@tanstack/react-query";
import { saveEstimate } from "@/lib/actions/save-estimate";
import type { LaneQuery } from "@/lib/types";

interface Input {
    lane: LaneQuery;
    rate: number;
}

export const useSaveEstimate = () =>
    useMutation({
        mutationFn: ({ lane, rate }: Input) => saveEstimate(lane, rate),
    });
