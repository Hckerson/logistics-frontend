"use client";
import clsx from "clsx";
import Checkbox from "@/components/ui/checkbox";
import TableHeading from "@/components/ui/table-heading";
import { TABLE_HEAD } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import type { TableColumn, TableSort } from "@/lib/types";

interface Props<Item> {
    columns: readonly TableColumn<Item>[];
    sort?: TableSort;
    onSortChange?: (sort: TableSort) => void;
    selectable: boolean;
    allOnPage: boolean;
    someOnPage: boolean;
    onTogglePage: (on: boolean) => void;
    expandable: boolean;
    withMenu: boolean;
}

const flip = (direction: TableSort["direction"]) => (direction === "ascending" ? "descending" : "ascending");

export default function TableHead<Item>(props: Props<Item>) {
    const { columns, sort, onSortChange, selectable, allOnPage, someOnPage, onTogglePage, expandable, withMenu } = props;

    const sortBy = (column: TableColumn<Item>) => () =>
        onSortChange?.({ column: column.key, direction: sort?.column === column.key ? flip(sort.direction) : "ascending" });

    return (
        <thead>
            <tr className="border-border border-b">
                {selectable ? (
                    <th scope="col" className={TABLE_HEAD}>
                        <Checkbox isSelected={allOnPage} isIndeterminate={someOnPage} onChange={onTogglePage}>
                            <span className="sr-only">{UI_COPY.selectPage}</span>
                        </Checkbox>
                    </th>
                ) : null}
                {expandable ? <td aria-hidden className={TABLE_HEAD} /> : null}
                {columns.map((column) => {
                    const direction = sort?.column === column.key ? sort.direction : undefined;
                    return (
                        <th
                            key={column.key}
                            scope="col"
                            aria-sort={direction}
                            className={clsx(TABLE_HEAD, column.align === "end" && "text-right")}
                        >
                            <TableHeading
                                label={column.label}
                                direction={direction}
                                end={column.align === "end"}
                                onSort={column.sortable && onSortChange ? sortBy(column) : undefined}
                            />
                        </th>
                    );
                })}
                {withMenu ? (
                    <th scope="col" className={TABLE_HEAD}>
                        <span className="sr-only">{UI_COPY.actionsColumn}</span>
                    </th>
                ) : null}
            </tr>
        </thead>
    );
}
