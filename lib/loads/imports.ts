import { CalendarDate } from "@internationalized/date";
import { TIME_MS } from "@/lib/constants";
import { importRowValuesDtoSchema, importUploadRequestDtoSchema } from "@/lib/contract/schemas";
import type { ActionFailure, ErrorClass, ImportField, ImportOutcome, ImportStatus, ImportStep } from "@/lib/types";
import { errorMessage } from "@/lib/utils/action-result";
import { BYTES_PER_MEGABYTE } from "@/lib/utils/format-number";

export const IMPORT_FIELDS = importRowValuesDtoSchema.keyof().options;

export const IMPORT_REQUIRED: readonly ImportField[] = ["reference", "pickupFacility", "pickupDate", "deliveryFacility", "deliveryDate", "equipment", "commodity", "weightLb"];

export const IMPORT_RULES = {
    maxBytes: 5 * BYTES_PER_MEGABYTE,
    maxRows: 500,
    pageSize: 100,
    historyPage: 20,
    fileNameMax: 200,
    valueMax: 500,
    idMax: 64,
    contentTypes: importUploadRequestDtoSchema.shape.contentType.options,
    batchPollMs: TIME_MS.second,
    historyPollMs: 5 * TIME_MS.second,
    historyDays: 90,
    weightMaxLb: 45_000,
    weightWarnLb: 43_000,
    unpricedMiles: 2_500,
    quoteMinutes: 30,
    repriceWarnSeconds: 5 * 60,
} as const;

export const IMPORT_BUSY: readonly ImportStatus[] = ["parsing", "validating", "pricing", "confirming"];

export const IMPORT_OUTCOMES: readonly ImportOutcome[] = ["invalid", "warning", "valid", "excluded"];

export const IMPORT_STEPS: readonly ImportStep[] = ["upload", "map", "check", "price", "done"];

export const IMPORT_STEP_OF: Record<ImportStatus, ImportStep> = {
    awaitingUpload: "upload",
    parsing: "upload",
    failed: "upload",
    mapping: "map",
    validating: "map",
    review: "check",
    pricing: "check",
    priced: "price",
    confirming: "price",
    completed: "done",
};

export const IMPORT_PARAM = "batch";

export const IMPORT_BOOLEAN = { yes: ["yes", "y", "true", "1"], no: ["no", "n", "false", "0", ""] } as const satisfies Record<string, readonly string[]>;

export const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

export const booleanOf = (text: string) => {
    const key = text.trim().toLowerCase();
    if (IMPORT_BOOLEAN.yes.some((word) => word === key)) return true;
    return IMPORT_BOOLEAN.no.some((word) => word === key) ? false : null;
};

export const importFailureText = (failure: ActionFailure, overrides: Partial<Record<ErrorClass, string>> = {}) => overrides[failure.errorClass] ?? errorMessage(failure);

const BATCH_ID = /^imp_[A-Za-z0-9_-]{21}$/;

export const importBatchParam = (raw: Record<string, string | string[] | undefined>) => {
    const value = raw[IMPORT_PARAM];
    return typeof value === "string" && BATCH_ID.test(value) ? value : null;
};

const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const US_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export const dateOf = (text: string) => {
    const iso = ISO_DATE.exec(text);
    const us = US_DATE.exec(text);
    const [year, month, day] = (iso ? [iso[1], iso[2], iso[3]] : us ? [us[3], us[1], us[2]] : []).map(Number);
    if (!year) return null;
    const date = new CalendarDate(year, month, day);
    return date.year === year && date.month === month && date.day === day ? date : null;
};
