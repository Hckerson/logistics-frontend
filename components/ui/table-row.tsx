"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronRight } from "@carbon/icons-react";
import Checkbox from "@/components/ui/checkbox";
import Menu from "@/components/ui/menu";
import { squareButtonClass } from "@/lib/ui/classes";
import { useReduced } from "@/lib/hooks/use-reduced";
import { TABLE_ACTIVE, TABLE_CELL, TABLE_ENTRY, TABLE_FLASH, TABLE_MOTION } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TableColumn, TableRowMenu } from "@/lib/types";

interface Props<Item> {
    row: Item;
    order: number;
    signature?: string;
    id: string;
    name: string;
    columns: readonly TableColumn<Item>[];
    span: number;
    picked?: boolean;
    onPick?: (on: boolean) => void;
    onArm: (event: PointerEvent | KeyboardEvent) => void;
    open?: boolean;
    onOpen?: () => void;
    preview?: ReactNode;
    menu?: TableRowMenu<Item>;
}

const INTERACTIVE = "a, button, input, label";
const EXPAND = { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 } } as const;

export default function TableRow<Item>(props: Props<Item>) {
    const { row, order, signature, id, name, columns, span, picked, onPick, onArm, open = false, onOpen, preview, menu } = props;
    const panelId = `${id}-preview`;
    const lead = Number(Boolean(onPick)) + Number(Boolean(onOpen));
    const element = useRef<HTMLTableRowElement>(null);
    const seen = useRef(signature);
    const reduced = useReduced();
    const entry = { ...TABLE_MOTION, delay: Math.min(order, TABLE_ENTRY.rows) * TABLE_ENTRY.step };

    useEffect(() => {
        const node = element.current;
        if (!node || seen.current === signature) return;
        seen.current = signature;
        if (reduced) return;
        const wash = getComputedStyle(node).getPropertyValue(TABLE_FLASH.colour).trim();
        node.animate([{ backgroundColor: wash }, { backgroundColor: "transparent" }], { duration: TABLE_FLASH.ms, easing: TABLE_FLASH.easing });
    }, [signature, reduced]);

    const openFromRow = (event: MouseEvent<HTMLTableRowElement>) => {
        if (!onOpen || window.getSelection()?.toString()) return;
        if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
        onOpen();
    };

    return (
        <>
            <motion.tr
                ref={element}
                layout="position"
                initial={{ opacity: 0, y: TABLE_ENTRY.rise }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...TABLE_MOTION, opacity: entry, y: entry }}
                onClick={openFromRow}
                className={clsx(
                    "text-text-secondary border-b text-xs transition-[background-color,box-shadow,color] duration-300",
                    open
                        ? clsx(TABLE_ACTIVE, "text-text border-transparent")
                        : picked
                          ? "border-border-light bg-background-muted/70 shadow-[inset_2px_0_0_var(--colors-accent)]"
                          : "border-border-light hover:bg-background-muted/40 shadow-[inset_0_0_0_var(--colors-accent)]",
                    onOpen && "cursor-pointer",
                )}
            >
                {onPick ? (
                    <td className={TABLE_CELL} onPointerDownCapture={onArm} onKeyDownCapture={onArm}>
                        <Checkbox isSelected={picked} onChange={onPick}>
                            <span className="sr-only">{fillTemplate(UI_COPY.selectRow, { name })}</span>
                        </Checkbox>
                    </td>
                ) : null}
                {onOpen ? (
                    <td className="h-9 px-1.5 align-middle first:pl-3">
                        <button
                            type="button"
                            onClick={onOpen}
                            aria-expanded={open}
                            aria-controls={open ? panelId : undefined}
                            aria-label={fillTemplate(open ? UI_COPY.collapseRow : UI_COPY.expandRow, { name })}
                            className={squareButtonClass("ghost", "sm")}
                        >
                            <ChevronRight aria-hidden className={clsx("size-3.5 transition-transform duration-200", open && "rotate-90")} />
                        </button>
                    </td>
                ) : null}
                {columns.map((column) => {
                    const Tag = column.rowHeader ? "th" : "td";
                    return (
                        <Tag
                            key={column.key}
                            scope={column.rowHeader ? "row" : undefined}
                            className={clsx(
                                TABLE_CELL,
                                "text-left font-normal",
                                column.rowHeader && "text-text",
                                column.align === "end" && "text-right font-mono tabular-nums",
                            )}
                        >
                            {column.cell(row)}
                        </Tag>
                    );
                })}
                {menu ? (
                    <td className={clsx(TABLE_CELL, "text-right")}>
                        <Menu
                            label={fillTemplate(UI_COPY.rowActions, { name })}
                            items={menu.items(row)}
                            onAction={(action) => menu.onAction(row, action)}
                            size="sm"
                        />
                    </td>
                ) : null}
            </motion.tr>
            <AnimatePresence initial={false}>
                {open && preview ? (
                    <tr key={panelId} id={panelId} className={clsx(TABLE_ACTIVE, "border-border-light border-b")}>
                        {lead > 0 ? <td colSpan={lead} /> : null}
                        <td colSpan={span - lead} className="p-0">
                            <motion.div {...EXPAND} transition={TABLE_MOTION} className="overflow-hidden">
                                <div className="pt-1 pr-4 pb-4 pl-3">{preview}</div>
                            </motion.div>
                        </td>
                    </tr>
                ) : null}
            </AnimatePresence>
        </>
    );
}
