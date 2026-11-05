"use client";
import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { Renew } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import HudCorners from "@/components/ui/hud-corners";
import ProgressLine from "@/components/ui/progress-line";
import TableBulkBar from "@/components/ui/table-bulk-bar";
import TableCards from "@/components/ui/table-cards";
import TableHead from "@/components/ui/table-head";
import TableMessage from "@/components/ui/table-message";
import TableRow from "@/components/ui/table-row";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";
import type { TableColumn, TablePreview, TableRowMenu, TableSelection, TableSort } from "@/lib/types";

interface Props<Item> {
    caption: string;
    note?: ReactNode;
    columns: readonly TableColumn<Item>[];
    rows: readonly Item[];
    rowKey: (row: Item) => string;
    rowLabel?: (row: Item) => string;
    sort?: TableSort;
    onSortChange?: (sort: TableSort) => void;
    selection?: TableSelection;
    menu?: TableRowMenu<Item>;
    preview?: TablePreview<Item>;
    loading?: boolean;
    failed?: boolean;
    onRetry?: () => void;
    empty?: ReactNode;
    footer?: ReactNode;
}

const STRIP = "border-border flex min-h-10 items-center justify-between gap-4 border-b px-4 py-1.5";

const sortAnnouncement = <Item,>(columns: readonly TableColumn<Item>[], sort: TableSort | undefined) => {
    const column = columns.find((entry) => entry.key === sort?.column);
    if (!sort || !column) return "";
    return fillTemplate(sort.direction === "ascending" ? UI_COPY.sortAscending : UI_COPY.sortDescending, { column: column.label });
};

export default function DataTable<Item>(props: Props<Item>) {
    const { caption, note, columns, rows, rowKey, rowLabel = rowKey, sort, onSortChange, selection, menu, preview } = props;
    const { loading = false, failed = false, onRetry, empty, footer } = props;
    const baseId = useId();
    const picks = useRowSelection(rows.map(rowKey), selection);
    const span = columns.length + Number(Boolean(selection)) + Number(Boolean(preview)) + Number(Boolean(menu));
    const settled = rows.length > 0;
    const message = <TableMessage loading={loading} failed={failed} empty={empty} onRetry={onRetry} />;

    return (
        <div aria-busy={loading || undefined} className="border-border-dark bg-background relative border">
            <HudCorners />
            <div className={clsx(STRIP, "transition-colors", picks.count > 0 && "bg-background-muted/60")}>
                {selection && picks.count > 0 ? (
                    <TableBulkBar count={picks.count} onClear={picks.clear}>
                        {selection.actions?.(selection.keys)}
                    </TableBulkBar>
                ) : (
                    <>
                        <p aria-hidden className="haulr-label text-text-muted">
                            {caption}
                        </p>
                        {note ? <div className="haulr-label text-text-muted">{note}</div> : null}
                    </>
                )}
            </div>
            {failed && settled ? (
                <div role="alert" className={STRIP}>
                    <p className="text-signal-warning text-xs">{UI_COPY.tableFailedKept}</p>
                    {onRetry ? (
                        <Button tone="ghost" size="sm" icon={Renew} onPress={onRetry}>
                            {UI_COPY.retry}
                        </Button>
                    ) : null}
                </div>
            ) : null}
            <div className="relative hidden overflow-x-auto sm:block">
                <table className="w-full min-w-160 table-fixed border-collapse">
                    <caption className="sr-only">{caption}</caption>
                    <colgroup>
                        {selection ? <col className="w-11" /> : null}
                        {preview ? <col className="w-10" /> : null}
                        {columns.map((column) => (
                            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
                        ))}
                        {menu ? <col className="w-14" /> : null}
                    </colgroup>
                    <TableHead
                        columns={columns}
                        sort={sort}
                        onSortChange={onSortChange}
                        selectable={Boolean(selection)}
                        allOnPage={picks.allOnPage}
                        someOnPage={picks.someOnPage}
                        onTogglePage={picks.togglePage}
                        expandable={Boolean(preview)}
                        withMenu={Boolean(menu)}
                    />
                    <tbody>
                        {settled ? (
                            rows.map((row) => {
                                const key = rowKey(row);
                                const open = preview?.open === key;
                                return (
                                    <TableRow
                                        key={key}
                                        row={row}
                                        id={`${baseId}-${key}`}
                                        name={rowLabel(row)}
                                        columns={columns}
                                        span={span}
                                        picked={picks.isPicked(key)}
                                        onPick={selection ? (on) => picks.toggle(key, on) : undefined}
                                        onArm={picks.arm}
                                        open={open}
                                        onOpen={preview ? () => preview.onOpen(open ? null : key) : undefined}
                                        preview={open ? preview?.render(row) : undefined}
                                        menu={menu}
                                    />
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={span} className="p-0">
                                    {message}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {loading && settled ? <ProgressLine className="absolute inset-x-0 top-9" /> : null}
            </div>
            <div className="sm:hidden">
                {settled ? <TableCards caption={caption} columns={columns} rows={rows} rowKey={rowKey} rowLabel={rowLabel} menu={menu} /> : message}
            </div>
            {footer ? <div className="border-border border-t px-4 py-2">{footer}</div> : null}
            <span role="status" className="sr-only">
                {sortAnnouncement(columns, sort)}
            </span>
            <span role="status" className="sr-only">
                {picks.count > 0 ? pluralize(picks.count, UI_COPY.selectedCount) : ""}
            </span>
        </div>
    );
}
