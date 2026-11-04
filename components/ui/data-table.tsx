"use client";
import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { Cell, Column, Row, Table, TableBody, TableHeader, type Selection, type SortDescriptor } from "react-aria-components";
import HudCorners from "@/components/ui/hud-corners";
import ProgressLine from "@/components/ui/progress-line";
import TableHeading from "@/components/ui/table-heading";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TableColumn, TableSort } from "@/lib/types";

interface Props<Item> {
    caption: string;
    note?: ReactNode;
    columns: readonly TableColumn<Item>[];
    rows: readonly Item[];
    rowKey: (row: Item) => string;
    sort?: TableSort;
    onSortChange?: (sort: TableSort) => void;
    selected?: string | null;
    onSelect?: (key: string | null) => void;
    detail?: (row: Item) => ReactNode;
    loading?: boolean;
    empty?: ReactNode;
    footer?: ReactNode;
    onRowAction?: (key: string) => void;
}

const FOCUS = "outline-none data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2";
const HEAD = `haulr-label text-text-muted group/head border-border-dark h-9 border-b px-4 text-left align-middle font-normal ${FOCUS}`;
const CELL = `h-10 px-4 align-middle ${FOCUS}`;
const ROW = [
    "border-border text-text-secondary border-b text-xs transition-colors last:border-b-0",
    "data-hovered:bg-background-muted/50 data-selected:bg-background-muted data-selected:text-text data-selected:shadow-[inset_2px_0_0_var(--colors-accent)]",
    FOCUS,
].join(" ");

const firstKey = (keys: Selection) => (keys === "all" ? null : ([...keys].map(String)[0] ?? null));

const sortAnnouncement = <Item,>(columns: readonly TableColumn<Item>[], sort: TableSort | undefined) => {
    const column = columns.find((entry) => entry.key === sort?.column);
    if (!sort || !column) return "";
    return fillTemplate(sort.direction === "ascending" ? UI_COPY.sortAscending : UI_COPY.sortDescending, { column: column.label });
};

export default function DataTable<Item>(props: Props<Item>) {
    const { caption, note, columns, rows, rowKey, sort, onSortChange, selected = null, onSelect, detail, loading = false, empty, footer, onRowAction } = props;
    const captionId = useId();
    const current = selected === null ? undefined : rows.find((row) => rowKey(row) === selected);

    const changeSort = (descriptor: SortDescriptor) => onSortChange?.({ column: String(descriptor.column), direction: descriptor.direction });

    return (
        <div aria-busy={loading || undefined} className="border-border-dark bg-background relative border">
            <HudCorners />
            <div className="border-border flex items-center justify-between gap-4 border-b px-4 py-2.5">
                <p id={captionId} className="haulr-label text-text-muted">
                    {caption}
                </p>
                {note ? <div className="haulr-label text-text-muted">{note}</div> : null}
            </div>
            <div className="relative overflow-x-auto">
                <Table
                    aria-labelledby={captionId}
                    sortDescriptor={sort}
                    onSortChange={changeSort}
                    selectionMode={onSelect ? "single" : "none"}
                    selectionBehavior="replace"
                    selectedKeys={selected === null ? [] : [selected]}
                    onSelectionChange={(keys) => onSelect?.(firstKey(keys))}
                    onRowAction={onRowAction ? (key) => onRowAction(String(key)) : undefined}
                    className="w-full border-collapse"
                >
                    <TableHeader>
                        {columns.map((column) => (
                            <Column
                                key={column.key}
                                id={column.key}
                                isRowHeader={column.rowHeader}
                                allowsSorting={column.sortable}
                                style={column.width ? { width: column.width } : undefined}
                                className={clsx(HEAD, column.align === "end" && "text-right", column.sortable && "cursor-pointer")}
                            >
                                {({ sortDirection }) => (
                                    <TableHeading label={column.label} sortable={Boolean(column.sortable)} direction={sortDirection} end={column.align === "end"} />
                                )}
                            </Column>
                        ))}
                    </TableHeader>
                    <TableBody renderEmptyState={empty === undefined ? undefined : () => <div className="text-text-muted px-4 py-6 text-xs">{empty}</div>}>
                        {rows.map((row) => (
                            <Row key={rowKey(row)} id={rowKey(row)} className={clsx(ROW, (onSelect || onRowAction) && "cursor-pointer")}>
                                {columns.map((column) => (
                                    <Cell
                                        key={column.key}
                                        className={clsx(CELL, column.rowHeader && "text-text", column.align === "end" && "text-right font-mono tabular-nums")}
                                    >
                                        {column.cell(row)}
                                    </Cell>
                                ))}
                            </Row>
                        ))}
                    </TableBody>
                </Table>
                {loading ? <ProgressLine className="absolute inset-x-0 top-9" /> : null}
            </div>
            {current && detail ? (
                <div key={selected} className="border-border haulr-fade-in border-t px-4 py-4">
                    {detail(current)}
                </div>
            ) : null}
            {footer ? <div className="border-border border-t px-4 py-2.5">{footer}</div> : null}
            <span role="status" className="sr-only">
                {sortAnnouncement(columns, sort)}
            </span>
        </div>
    );
}
