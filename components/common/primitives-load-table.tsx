"use client";
import { useMemo, useState } from "react";
import LaneLabel from "@/components/common/lane-label";
import PrimitivesLoadDetail from "@/components/common/primitives-load-detail";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/ui/pagination";
import StatusLabel from "@/components/ui/status-label";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_LOADS, SPECIMEN_TOTAL } from "@/lib/data/primitives/samples";
import { loadStatusDisplay } from "@/lib/loads/status";
import { money } from "@/lib/quotes/format";
import { grouped } from "@/lib/utils/format-number";
import type { SpecimenLoad, TableColumn, TableSort } from "@/lib/types";

const { tableCaption, tableNote, columns: label } = PRIMITIVES_COPY.demo;

const COLUMNS: readonly TableColumn<SpecimenLoad>[] = [
    { key: "reference", label: label.reference, sortable: true, rowHeader: true, cell: (row) => <span className="font-mono">{row.reference}</span> },
    { key: "lane", label: label.lane, cell: (row) => <LaneLabel origin={row.origin} destination={row.destination} /> },
    { key: "status", label: label.status, cell: (row) => <StatusLabel {...loadStatusDisplay(row.status, row.qualifier)} tag /> },
    { key: "pickup", label: label.pickup, cell: (row) => <span className="font-mono">{row.pickup}</span> },
    { key: "miles", label: label.miles, sortable: true, align: "end", cell: (row) => grouped(row.miles) },
    { key: "rate", label: label.rate, sortable: true, align: "end", cell: (row) => <span className="text-text">{money(row.rate)}</span> },
];

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

export default function PrimitivesLoadTable() {
    const [sort, setSort] = useState<TableSort>({ column: "rate", direction: "descending" });
    const [selected, setSelected] = useState<string | null>(SPECIMEN_LOADS[0].reference);
    const [page, setPage] = useState(1);
    const rows = useMemo(() => [...SPECIMEN_LOADS].sort(compare(sort)), [sort]);
    const shown = Math.min(page * SPECIMEN_LOADS.length, SPECIMEN_TOTAL);

    return (
        <div className="w-full">
            <DataTable
                caption={tableCaption}
                note={tableNote}
                columns={COLUMNS}
                rows={rows}
                rowKey={(row) => row.reference}
                sort={sort}
                onSortChange={setSort}
                selected={selected}
                onSelect={setSelected}
                detail={(load) => <PrimitivesLoadDetail load={load} />}
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
