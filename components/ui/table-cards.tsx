"use client";
import Menu from "@/components/ui/menu";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TableColumn, TableRowMenu } from "@/lib/types";

interface Props<Item> {
    caption: string;
    columns: readonly TableColumn<Item>[];
    rows: readonly Item[];
    rowKey: (row: Item) => string;
    rowLabel: (row: Item) => string;
    menu?: TableRowMenu<Item>;
}

export default function TableCards<Item>({ caption, columns, rows, rowKey, rowLabel, menu }: Props<Item>) {
    const title = columns.find((column) => column.rowHeader);
    const aside = columns.find((column) => column.phone === "aside");
    const fields = columns.filter((column) => column !== title && column !== aside && column.phone !== "hidden");

    return (
        <ul aria-label={caption} className="flex flex-col">
            {rows.map((row) => (
                <li key={rowKey(row)} className="border-border-light flex flex-col gap-2.5 border-b px-4 py-3 last:border-b-0">
                    <div className="flex min-h-7 items-center justify-between gap-3">
                        <div className="text-text min-w-0 truncate text-xs">{title ? title.cell(row) : rowLabel(row)}</div>
                        <div className="flex shrink-0 items-center gap-1">
                            {aside ? aside.cell(row) : null}
                            {menu ? (
                                <Menu
                                    label={fillTemplate(UI_COPY.rowActions, { name: rowLabel(row) })}
                                    items={menu.items(row)}
                                    onAction={(action) => menu.onAction(row, action)}
                                    size="sm"
                                />
                            ) : null}
                        </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {fields.map((column) => (
                            <div key={column.key} className="flex min-w-0 flex-col gap-0.5">
                                <dt className={LABEL_TEXT}>{column.label}</dt>
                                <dd className="text-text-secondary truncate text-xs tabular-nums">{column.cell(row)}</dd>
                            </div>
                        ))}
                    </dl>
                </li>
            ))}
        </ul>
    );
}
