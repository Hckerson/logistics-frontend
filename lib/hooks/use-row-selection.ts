import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { TableSelection } from "@/lib/types";

const NONE: ReadonlySet<string> = new Set();

export function useRowSelection(keys: readonly string[], selection: TableSelection | undefined) {
    const anchor = useRef<string | null>(null);
    const ranged = useRef(false);
    const picked = selection?.keys ?? NONE;
    const onPage = keys.filter((key) => picked.has(key)).length;

    const write = (targets: readonly string[], on: boolean) => {
        const next = new Set(picked);
        targets.forEach((key) => (on ? next.add(key) : next.delete(key)));
        selection?.onChange(next);
    };

    const toggle = (key: string, on: boolean) => {
        const from = anchor.current === null ? -1 : keys.indexOf(anchor.current);
        const to = keys.indexOf(key);
        const span = ranged.current && from >= 0 ? keys.slice(Math.min(from, to), Math.max(from, to) + 1) : [key];
        anchor.current = key;
        ranged.current = false;
        write(span, on);
    };

    const arm = (event: PointerEvent | KeyboardEvent) => {
        ranged.current = event.shiftKey;
    };

    return {
        count: picked.size,
        isPicked: (key: string) => picked.has(key),
        allOnPage: keys.length > 0 && onPage === keys.length,
        someOnPage: onPage > 0 && onPage < keys.length,
        toggle,
        togglePage: (on: boolean) => write(keys, on),
        clear: () => selection?.onChange(NONE),
        arm,
    };
}
