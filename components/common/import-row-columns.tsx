import StatusLabel from "@/components/ui/status-label";
import type { ImportRowDto } from "@/lib/contract/schemas";
import { IMPORT_REVIEW_COPY } from "@/lib/data/loads/import-review-copy";
import type { TableColumn } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

const { columns: copy, outcomes } = IMPORT_REVIEW_COPY;

const problemOf = ({ issues }: ImportRowDto) => {
    const [first, ...rest] = issues;
    if (!first) return "";
    return rest.length > 0 ? `${first.message} ${pluralize(rest.length, IMPORT_REVIEW_COPY.more)}` : first.message;
};

export const IMPORT_ROW_COLUMNS: readonly TableColumn<ImportRowDto>[] = [
    { key: "line", label: copy.line, phone: "hidden", cell: (row) => <span className="font-mono tabular-nums">{row.line}</span> },
    { key: "reference", label: copy.reference, rowHeader: true, cell: (row) => row.values.reference || IMPORT_REVIEW_COPY.blank },
    { key: "lane", label: copy.lane, cell: (row) => fillTemplate(IMPORT_REVIEW_COPY.lane, { from: row.values.pickupFacility || IMPORT_REVIEW_COPY.blank, to: row.values.deliveryFacility || IMPORT_REVIEW_COPY.blank }) },
    { key: "pickup", label: copy.pickup, phone: "hidden", cell: (row) => <span className="font-mono">{row.values.pickupDate}</span> },
    { key: "equipment", label: copy.equipment, phone: "hidden", cell: (row) => row.values.equipment },
    { key: "weight", label: copy.weight, align: "end", phone: "hidden", cell: (row) => row.values.weightLb },
    { key: "outcome", label: copy.outcome, phone: "aside", cell: (row) => <StatusLabel {...outcomes[row.excluded ? "excluded" : row.outcome]} /> },
    { key: "problem", label: copy.problem, cell: (row) => <span className="text-text-muted block max-w-80 truncate">{problemOf(row)}</span> },
];
