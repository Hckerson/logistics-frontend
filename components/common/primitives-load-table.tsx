"use client";
import { useMemo, useState } from "react";
import { Copy, Download, Launch, TrashCan } from "@carbon/icons-react";
import { LOAD_COLUMNS } from "@/components/common/primitives-load-columns";
import PrimitivesLoadDetail from "@/components/common/primitives-load-detail";
import Button from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/ui/pagination";
import SearchField from "@/components/ui/search-field";
import SegmentedControl from "@/components/ui/segmented-control";
import { appRoutes } from "@/lib/app-routes";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_CANCELLABLE, SPECIMEN_LOADS, SPECIMEN_TABLE_STATES, SPECIMEN_TOTAL } from "@/lib/data/primitives/samples";
import { money } from "@/lib/quotes/format";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { MenuEntry, SpecimenLoad, TableSort } from "@/lib/types";

type TableState = (typeof SPECIMEN_TABLE_STATES)[number];

const { demo } = PRIMITIVES_COPY;
const { rowMenu } = demo;
const STATES = SPECIMEN_TABLE_STATES.map((value) => ({ value, label: demo.tableStates[value] }));

const SORT_VALUES: Readonly<Record<string, (row: SpecimenLoad) => string | number>> = {
    reference: (row) => row.reference,
    miles: (row) => row.miles,
    rate: (row) => row.rate,
};

const compare = (sort: TableSort) => (left: SpecimenLoad, right: SpecimenLoad) => {
    const value = SORT_VALUES[sort.column];
    if (!value) return 0;
    const order = value(left) < value(right) ? -1 : value(left) > value(right) ? 1 : 0;
    return sort.direction === "ascending" ? order : -order;
};

const matches = (query: string) => (row: SpecimenLoad) =>
    [row.reference, row.origin, row.destination, row.carrier].some((field) => field.toLowerCase().includes(query.trim().toLowerCase()));

const menuItems = (row: SpecimenLoad): readonly MenuEntry[] => [
    { id: "open", label: rowMenu.open, icon: Launch, href: appRoutes.load(row.reference) },
    { id: "copy", label: rowMenu.copy, icon: Copy },
    { id: "cancel", label: rowMenu.cancel, icon: TrashCan, destructive: true, disabledReason: SPECIMEN_CANCELLABLE.includes(row.status) ? undefined : demo.cancelReason },
];

export default function PrimitivesLoadTable() {
    const [state, setState] = useState<TableState>("ready");
    const [sort, setSort] = useState<TableSort>({ column: "rate", direction: "descending" });
    const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
    const [open, setOpen] = useState<string | null>(SPECIMEN_LOADS[0].reference);
    const [cancelled, setCancelled] = useState<ReadonlySet<string>>(new Set());
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const shown = Math.min(page * SPECIMEN_LOADS.length, SPECIMEN_TOTAL);

    const rows = useMemo(
        () =>
            SPECIMEN_LOADS.map((load): SpecimenLoad => (cancelled.has(load.reference) ? { ...load, status: "Cancelled", qualifier: undefined } : load)).sort(
                compare(sort),
            ),
        [sort, cancelled],
    );
    const found = query.trim() ? rows.filter(matches(query)) : rows;

    const totalOf = (keys: ReadonlySet<string>) => rows.filter((row) => keys.has(row.reference)).reduce((sum, row) => sum + row.rate, 0);

    const act = (row: SpecimenLoad, action: string) => {
        if (action === "copy") navigator.clipboard.writeText(row.reference).catch(() => undefined);
        if (action === "cancel") setCancelled((current) => new Set(current).add(row.reference));
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <SegmentedControl label={demo.tableState} options={STATES} value={state} onChange={setState} size="sm" className="self-start" />
            <DataTable
                caption={demo.tableCaption}
                count={query.trim() ? found.length : SPECIMEN_TOTAL}
                note={demo.tableNote}
                tools={
                    <div className="w-56">
                        <SearchField label={demo.searchLabel} value={query} onChange={setQuery} placeholder={demo.searchPlaceholder} size="sm" />
                    </div>
                }
                columns={LOAD_COLUMNS}
                rows={state === "loading" || state === "empty" ? [] : found}
                rowKey={(row) => row.reference}
                rowSignature={(row) => row.status}
                sort={sort}
                onSortChange={setSort}
                selection={{
                    keys: picked,
                    onChange: setPicked,
                    actions: (keys) => (
                        <>
                            <span className="text-text-muted text-xs tabular-nums">{fillTemplate(demo.tableTotal, { total: money(totalOf(keys)) })}</span>
                            <Button tone="outline" size="sm" icon={Download}>
                                {demo.tableExport}
                            </Button>
                        </>
                    ),
                }}
                menu={{ items: menuItems, onAction: act }}
                preview={{ open, onOpen: setOpen, render: (load) => <PrimitivesLoadDetail load={load} /> }}
                loading={state === "loading" || state === "refreshing"}
                failed={state === "failed"}
                onRetry={() => setState("ready")}
                empty={query.trim() && state !== "empty" ? demo.tableNoMatch : demo.tableEmpty}
                footer={
                    <Pagination
                        mode="pages"
                        shown={shown}
                        total={SPECIMEN_TOTAL}
                        hasPrevious={page > 1}
                        hasNext={shown < SPECIMEN_TOTAL}
                        onPrevious={() => setPage((current) => current - 1)}
                        onNext={() => setPage((current) => current + 1)}
                    />
                }
            />
        </div>
    );
}
