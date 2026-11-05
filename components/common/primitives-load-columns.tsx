import Link from "next/link";
import LaneLabel from "@/components/common/lane-label";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { loadStatusDisplay } from "@/lib/loads/status";
import { money } from "@/lib/quotes/format";
import { RECORD_LINK } from "@/lib/ui/constants";
import { grouped } from "@/lib/utils/format-number";
import type { SpecimenLoad, TableColumn } from "@/lib/types";

const { columns: label } = PRIMITIVES_COPY.demo;

export const LOAD_COLUMNS: readonly TableColumn<SpecimenLoad>[] = [
    {
        key: "reference",
        label: label.reference,
        sortable: true,
        rowHeader: true,
        width: "8.5rem",
        cell: (row) => (
            <Link href={appRoutes.load(row.reference)} className={RECORD_LINK}>
                {row.reference}
            </Link>
        ),
    },
    { key: "lane", label: label.lane, cell: (row) => <LaneLabel origin={row.origin} destination={row.destination} /> },
    { key: "status", label: label.status, width: "10rem", phone: "aside", cell: (row) => <StatusLabel {...loadStatusDisplay(row.status, row.qualifier)} tag /> },
    {
        key: "pickup",
        label: label.pickup,
        width: "9rem",
        cell: (row) => (
            <span>
                {row.pickup.day} <span className="text-text-muted font-mono">{row.pickup.time}</span>
            </span>
        ),
    },
    { key: "miles", label: label.miles, sortable: true, align: "end", width: "5.5rem", phone: "hidden", cell: (row) => grouped(row.miles) },
    { key: "rate", label: label.rate, sortable: true, align: "end", width: "7rem", cell: (row) => <span className="text-text">{money(row.rate)}</span> },
];
