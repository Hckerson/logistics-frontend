"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowsVertical } from "@carbon/icons-react";
import { Cell, Column, Row, Table, TableBody, TableHeader, type SortDescriptor } from "react-aria-components";
import ProgressLine from "@/components/ui/progress-line";
import { UI_COPY } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TableColumn, TableSort } from "@/lib/types";

interface Props<Item> {
    caption: string;
    columns: readonly TableColumn<Item>[];
    rows: readonly Item[];
    rowKey: (row: Item) => string;
    sort?: TableSort;
    onSortChange?: (sort: TableSort) => void;
    loading?: boolean;
    empty?: ReactNode;
    onRowAction?: (key: string) => void;
}

const HEAD =
    "haulr-label text-text-muted group/head border-border-dark h-8 border-b px-3 text-left align-middle font-normal outline-none data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2";
const CELL = "h-9 px-3 py-2 align-middle outline-none data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2";
const ROW =
    "border-border text-text-secondary border-b text-xs transition-colors outline-none last:border-b-0 data-hovered:bg-background-muted/60 data-focus-visible:outline-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2";

const sortAnnouncement = <Item,>(columns: readonly TableColumn<Item>[], sort: TableSort | undefined) => {
    const column = columns.find((entry) => entry.key === sort?.column);
    if (!sort || !column) return "";
    return fillTemplate(sort.direction === "ascending" ? UI_COPY.sortAscending : UI_COPY.sortDescending, { column: column.label });
};

export default function DataTable<Item>(props: Props<Item>) {
    const { caption, columns, rows, rowKey, sort, onSortChange, loading = false, empty, onRowAction } = props;

    const changeSort = (descriptor: SortDescriptor) =>
        onSortChange?.({ column: String(descriptor.column), direction: descriptor.direction });

    return (
        <div aria-busy={loading || undefined} className="relative">
            <div className="overflow-x-auto">
                <Table
                    aria-label={caption}
                    sortDescriptor={sort}
                    onSortChange={changeSort}
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
                                className={clsx(HEAD, column.align === "end" && "text-right", column.sortable && "hover:text-text-secondary cursor-pointer")}
                            >
                                {({ sortDirection, allowsSorting }) => {
                                    const Glyph = sortDirection === "descending" ? ArrowDown : sortDirection ? ArrowUp : ArrowsVertical;
                                    return (
                                        <span className={clsx("inline-flex items-center gap-1.5", column.align === "end" && "flex-row-reverse")}>
                                            {column.label}
                                            {allowsSorting ? (
                                                <Glyph
                                                    aria-hidden
                                                    className={clsx(
                                                        "size-3.5 shrink-0 transition-opacity",
                                                        sortDirection ? "text-accent" : "opacity-0 group-hover/head:opacity-100",
                                                    )}
                                                />
                                            ) : null}
                                        </span>
                                    );
                                }}
                            </Column>
                        ))}
                    </TableHeader>
                    <TableBody
                        renderEmptyState={empty === undefined ? undefined : () => <div className="text-text-muted px-3 py-6 text-xs">{empty}</div>}
                    >
                        {rows.map((row) => (
                            <Row key={rowKey(row)} id={rowKey(row)} className={clsx(ROW, onRowAction && "cursor-pointer")}>
                                {columns.map((column) => (
                                    <Cell
                                        key={column.key}
                                        className={clsx(CELL, column.rowHeader && "text-text", column.align === "end" && "text-right tabular-nums")}
                                    >
                                        {column.cell(row)}
                                    </Cell>
                                ))}
                            </Row>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {loading ? <ProgressLine className="absolute inset-x-0 top-8" /> : null}
            <span role="status" className="sr-only">
                {sortAnnouncement(columns, sort)}
            </span>
        </div>
    );
}
