"use client";
import { useMemo, useState } from "react";
import DataTable from "@/components/ui/data-table";
import StatusLabel from "@/components/ui/status-label";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_LOADS } from "@/lib/data/primitives/samples";
import { money } from "@/lib/quotes/format";
import { grouped } from "@/lib/utils/format-number";
import type { SpecimenLoad, TableColumn, TableSort } from "@/lib/types";

interface Props {
    caption: string;
}

const { columns: label } = PRIMITIVES_COPY.demo;

const COLUMNS: readonly TableColumn<SpecimenLoad>[] = [
    { key: "reference", label: label.reference, sortable: true, rowHeader: true, cell: (row) => <span className="font-mono">{row.reference}</span> },
    { key: "lane", label: label.lane, cell: (row) => row.lane },
    { key: "status", label: label.status, cell: (row) => <StatusLabel label={row.status} tone={row.tone} pulse={row.tone === "live"} /> },
    { key: "pickup", label: label.pickup, cell: (row) => row.pickup },
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

export default function PrimitivesLoadTable({ caption }: Props) {
    const [sort, setSort] = useState<TableSort>({ column: "rate", direction: "descending" });
    const rows = useMemo(() => [...SPECIMEN_LOADS].sort(compare(sort)), [sort]);

    return (
        <div className="w-full">
            <DataTable caption={caption} columns={COLUMNS} rows={rows} rowKey={(row) => row.reference} sort={sort} onSortChange={setSort} />
        </div>
    );
}
