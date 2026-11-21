import { useRef, useState, type KeyboardEvent } from "react";
import type { FleetEntryDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { FLEET } from "@/lib/fleet/constants";
import { cellItems, moveVerdict } from "@/lib/fleet/grid";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import type { GridFocus, PlanMove, PlanRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Options {
    rows: readonly PlanRow[];
    readOnly: boolean;
    onDrop: (entry: FleetEntryDto, target: PlanRow, from: PlanRow) => void;
    onWeek: (weeks: number) => void;
}

const { grid: copy } = FLEET_COPY;
const COLUMNS = FLEET.weekDays + 1;
const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

const selectorOf = ({ row, col, item }: Pick<GridFocus, "row" | "col" | "item">) =>
    item === null ? `[data-cell="${row}:${col}"]` : `[data-item="${row}:${col}:${item}"]`;

export const usePlanGrid = ({ rows, readOnly, onDrop, onWeek }: Options) => {
    const grid = useRef<HTMLDivElement>(null);
    const [focus, setFocus] = useState<GridFocus>({ row: 0, col: 1, item: null, entered: false });
    const [move, setMove] = useState<PlanMove | null>(null);
    const [status, setStatus] = useState("");

    const countAt = (row: number, col: number) => (col === 0 ? Number(Boolean(rows[row]?.truck) && !readOnly) : cellItems(rows[row], col - 1).length);
    const entryAt = ({ row, col, item }: GridFocus) => (col > 0 && item !== null ? cellItems(rows[row], col - 1)[item]?.item : undefined);

    const go = (next: GridFocus) => {
        setFocus(next);
        grid.current?.querySelector<HTMLElement>(selectorOf(next))?.focus();
    };

    const land = (row: number, col: number) => {
        const target = { row: clamp(row, rows.length - 1), col: clamp(col, COLUMNS - 1) };
        go({ ...target, item: countAt(target.row, target.col) === 1 ? 0 : null, entered: false });
    };

    const verdictOf = (state: PlanMove) => moveVerdict(state.entry, rows[state.from], rows[state.target]);

    const aim = (state: PlanMove, step: number) => {
        let target = state.target + step;
        while (rows[target] && !rows[target].truck) target += step;
        if (!rows[target]) return;
        const next = { ...state, target };
        setMove(next);
        setStatus(verdictOf(next).message);
        grid.current?.querySelector(`[aria-rowindex="${target + 2}"]`)?.scrollIntoView({ block: "nearest" });
    };

    const finish = (state: PlanMove, drop: boolean) => {
        setMove(null);
        const verdict = verdictOf(state);
        setStatus(drop && verdict.valid ? "" : drop ? verdict.message : fillTemplate(copy.cancelled, { load: state.entry.loadId }));
        if (drop && verdict.valid) return onDrop(state.entry, rows[state.target], rows[state.from]);
        go(focus);
    };

    const pickUp = (entry: FleetEntryDto, row: number) => {
        if (readOnly || !entry.movable) return setStatus(fillTemplate(copy.locked, { load: entry.loadId, status: LOAD_STATUS_LABELS[entry.status] }));
        setMove({ entry, from: row, target: row });
        setStatus(fillTemplate(copy.pickedUp, { load: entry.loadId }));
    };

    const moving = (key: string, state: PlanMove) => {
        const keys: Record<string, () => void> = {
            ArrowUp: () => aim(state, -1),
            ArrowDown: () => aim(state, 1),
            " ": () => finish(state, true),
            Enter: () => finish(state, true),
            Escape: () => finish(state, false),
        };
        const handler = keys[key];
        handler?.();
        return Boolean(handler);
    };

    const browsing = (event: KeyboardEvent<HTMLDivElement>) => {
        const { row, col, item, entered } = focus;
        const count = countAt(row, col);
        const within = entered && item !== null;
        const index = item ?? 0;
        const placed = entryAt(focus);
        const keys: Record<string, () => boolean | void> = {
            ArrowLeft: () => land(row, col - 1),
            ArrowRight: () => land(row, col + 1),
            ArrowUp: () => (within ? go({ ...focus, item: Math.max(index - 1, 0) }) : land(row - 1, col)),
            ArrowDown: () => (within ? go({ ...focus, item: Math.min(index + 1, count - 1) }) : land(row + 1, col)),
            Home: () => land(event.ctrlKey ? 0 : row, 0),
            End: () => land(event.ctrlKey ? rows.length - 1 : row, COLUMNS - 1),
            PageUp: () => onWeek(-1),
            PageDown: () => onWeek(1),
            Escape: () => (within && count > 1 ? go({ ...focus, item: null, entered: false }) : false),
            Enter: () => (item === null && count > 1 ? go({ ...focus, item: 0, entered: true }) : false),
            " ": () => (placed?.kind === "entry" ? pickUp(placed.entry, row) : false),
        };
        return keys[event.key]?.() !== false && event.key in keys;
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (move ? moving(event.key, move) : browsing(event)) event.preventDefault();
    };

    const sync = (next: GridFocus) => setFocus(next);

    const drag = {
        start: (entry: FleetEntryDto, row: number) => (readOnly || !entry.movable ? undefined : setMove({ entry, from: row, target: row })),
        over: (row: number) => {
            if (!move || !rows[row].truck) return false;
            if (move.target !== row) setMove({ ...move, target: row });
            return true;
        },
        drop: () => (move ? finish(move, true) : undefined),
        end: () => setMove(null),
    };

    return { grid, focus, move, status, verdict: move ? verdictOf(move) : null, onKeyDown, sync, drag };
};
