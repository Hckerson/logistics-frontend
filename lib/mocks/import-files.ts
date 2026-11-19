import { fromAbsolute, toCalendarDate, today } from "@internationalized/date";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_IMPORTS } from "@/lib/data/mocks/imports";
import { MOCK_IMPORT_PLANS } from "@/lib/data/mocks/import-samples";
import { IMPORT_FIELDS } from "@/lib/loads/imports";
import { freightStore } from "@/lib/mocks/freight-store";
import { resultsCsv } from "@/lib/mocks/import-price";
import { importBatches, statusOf } from "@/lib/mocks/import-store";
import type { ImportField, ImportValues, MockImportPlan, MockImportSample } from "@/lib/types";
import { csvLine } from "@/lib/utils/csv";
import { fillTemplate } from "@/lib/utils/fill-template";

type Columns = readonly (readonly [string, ImportField | null])[];
type Style = MockImportPlan["style"];

const TEMPLATE_COLUMNS: Columns = IMPORT_FIELDS.map((field) => [IMPORT_FIELD_SPECS[field].label, field] as const);
const EXTENSION = /\.[^.]+$/;

const known = (code: string) => Object.hasOwn(MOCK_FACILITIES, code);

const placeOf = (text: string, style: Style) => {
    if (!known(text)) return text;
    const place = MOCK_FACILITIES[text];
    return style === "city" ? `${place.city}, ${place.region}` : place.name;
};

const dayIn = (moment: string, timeZone: string) => toCalendarDate(fromAbsolute(Date.parse(moment), timeZone)).toString();

const valuesOf = (sample: MockImportSample, style: Style, suffix: string): Partial<ImportValues> => {
    const pickup = today(known(sample.from) ? MOCK_FACILITIES[sample.from].timeZone : MOCK_IMPORTS.fallbackZone).add({ days: sample.inDays });
    return {
        reference: `${sample.reference}${suffix}`,
        pickupFacility: placeOf(sample.from, style),
        deliveryFacility: placeOf(sample.to, style),
        pickupDate: pickup.toString(),
        deliveryDate: pickup.add({ days: sample.days }).toString(),
        equipment: sample.equipment,
        commodity: sample.commodity,
        weightLb: sample.weight,
        ...sample.extra,
    };
};

const seededDuplicate = (reference: string, style: Style): Partial<ImportValues>[] => {
    const load = [...freightStore().loads.values()].find((candidate) => candidate.stops[0].reference === reference);
    if (!load) return [];
    const [pickup, delivery] = [load.stops[0], load.stops[load.stops.length - 1]];
    return [
        {
            reference,
            pickupFacility: placeOf(pickup.facility, style),
            deliveryFacility: placeOf(delivery.facility, style),
            pickupDate: dayIn(pickup.windowStart, MOCK_FACILITIES[pickup.facility].timeZone),
            deliveryDate: dayIn(delivery.windowStart, MOCK_FACILITIES[delivery.facility].timeZone),
            equipment: load.equipment,
            commodity: load.commodity,
            weightLb: String(load.weightLb),
        },
    ];
};

const csvOf = (columns: Columns, rows: readonly ((field: ImportField) => string)[], header: boolean) =>
    [...(header ? [csvLine(columns.map(([label]) => label))] : []), ...rows.map((cell) => csvLine(columns.map(([, field]) => (field ? cell(field) : ""))))].join("\n");

export const templateFile = () => ({
    fileName: MOCK_IMPORTS.templateFile,
    body: csvOf(TEMPLATE_COLUMNS, [(field) => IMPORT_FIELD_SPECS[field].example], true),
});

export const sampleFile = (name: string) => {
    if (!Object.hasOwn(MOCK_IMPORT_PLANS, name)) return null;
    const plan = MOCK_IMPORT_PLANS[name];
    const suffixes = Array.from({ length: plan.repeat ?? 1 }, (_, copy) => (plan.repeat ? `-${copy + 1}` : ""));
    const rows = [...suffixes.flatMap((suffix) => plan.rows.map((sample) => valuesOf(sample, plan.style, suffix))), ...(plan.duplicateStop ? seededDuplicate(plan.duplicateStop, plan.style) : [])];
    const columns = plan.columns === "template" ? TEMPLATE_COLUMNS : plan.columns;
    return { fileName: name, body: csvOf(columns, rows.map((row) => (field: ImportField) => row[field] ?? ""), plan.header ?? true) };
};

export const resultsFile = (batchId: string) => {
    const batch = importBatches().get(batchId);
    if (!batch || statusOf(batch, new Date().getTime()) !== "completed") return null;
    return { fileName: fillTemplate(MOCK_IMPORTS.resultsFile, { name: batch.fileName.replace(EXTENSION, "") }), body: resultsCsv(batch) };
};
