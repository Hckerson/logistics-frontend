import type { z } from "zod";
import type { BOARD_VIEWS } from "@/lib/load-board/constants";
import type { loadBoardQuerySchema } from "@/lib/validations/load-board";

export type LoadBoardQuery = z.infer<typeof loadBoardQuerySchema>;

export type BoardView = (typeof BOARD_VIEWS)[number];

export interface BoardSearch {
    query: LoadBoardQuery;
    view: BoardView;
    next: string | null;
}
