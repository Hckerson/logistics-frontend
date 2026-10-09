import { BOARD } from "@/lib/auth/constants";

export function boardWindow(text: string, caret: number | null, cells: number) {
    const start = caret === null ? 0 : Math.max(0, caret - cells + 1);
    const glyphs = Array.from({ length: cells }, (_, index) => text[start + index] ?? "");
    if (start > 0) glyphs[0] = BOARD.more;
    if (caret === null && text.length > cells) glyphs[cells - 1] = BOARD.more;
    return { glyphs, caret: caret === null ? null : caret - start };
}
