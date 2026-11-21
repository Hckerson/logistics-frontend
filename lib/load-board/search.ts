import { appRoutes } from "@/lib/app-routes";
import type { BoardSearch, BoardView, LoadBoardQuery } from "@/lib/types";
import { internalPath } from "@/lib/utils/internal-path";
import { queryString } from "@/lib/utils/query-string";
import { loadBoardQuerySchema } from "@/lib/validations/load-board";

type Search = Record<string, string | string[] | undefined>;

const FIELDS = ["origin", "originRadius", "destination", "destinationRadius", "from", "to", "equipment", "minRate", "minRpm", "maxWeight"] as const;

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export const parseBoardSearch = (search: Search): BoardSearch => {
    const raw = Object.fromEntries(FIELDS.flatMap((field) => (single(search[field]) ? [[field, single(search[field])]] : [])));
    const parsed = loadBoardQuerySchema.safeParse(raw);
    const next = internalPath(single(search.next), "");
    return { query: parsed.success ? parsed.data : {}, view: single(search.view) === "map" ? "map" : "list", next: next || null };
};

export const boardHref = (query: LoadBoardQuery, view: BoardView, next: string | null) =>
    `${appRoutes.loadBoard()}${queryString({ ...query, view: view === "map" ? view : undefined, next: next ?? undefined })}`;

export const activeFilters = (query: LoadBoardQuery) => FIELDS.filter((field) => query[field] !== undefined && !field.endsWith("Radius")).length;
