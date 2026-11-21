import { FREIGHT_COPY } from "@/lib/data/loads/post-freight-copy";
import { LANE_COPY } from "@/lib/data/loads/post-copy";
import { POSTING } from "@/lib/loads/posting";
import type { FormProblem, FreightEntries, LaneEntries } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";
import { freightEntriesSchema, laneEntriesSchema } from "@/lib/validations/posting";

type StopField = "facilityId" | "window" | "reference" | "instructions";
type FreightField = keyof typeof FREIGHT_COPY.errors;

const STOP_COPY = { facilityId: "facility", window: "window", reference: "reference", instructions: "instructions" } as const satisfies Record<StopField, keyof typeof LANE_COPY.errors>;

const LIMITS = {
    max: grouped(POSTING.weightLb),
    min: String(POSTING.tempF.min),
} as const;

const pick = (table: Readonly<Record<string, string>>, code: string) => (code in table ? table[code] : null);

export const codeOf = (errors: readonly unknown[]): string | null => {
    for (const error of errors) {
        if (typeof error === "string") return error;
        if (Array.isArray(error)) return codeOf(error);
        if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
    }
    return null;
};

export const stopFieldId = (key: string, field: StopField) => `stop-${key}-${field}`;

export const freightFieldId = (field: FreightField) => `freight-${field}`;

const isStopField = (value: unknown): value is StopField => typeof value === "string" && value in STOP_COPY;

const isFreightField = (value: unknown): value is FreightField => typeof value === "string" && value in FREIGHT_COPY.errors;

export const stopMessage = (field: StopField, code: string, index: number) => {
    const text = pick(LANE_COPY.errors[STOP_COPY[field]], code);
    return text ? fillTemplate(text, { index: String(index + 1) }) : null;
};

export const freightMessage = (field: FreightField, code: string) => {
    const text = pick(FREIGHT_COPY.errors[field], code);
    const max = field === "weightLb" ? LIMITS.max : field === "pallets" ? String(POSTING.pallets) : field === "commodity" ? String(POSTING.commodity) : String(POSTING.tempF.max);
    return text ? fillTemplate(text, { max, min: LIMITS.min }) : null;
};

export const laneProblems = (entries: LaneEntries): FormProblem<string>[] => {
    const result = laneEntriesSchema.safeParse(entries);
    if (result.success) return [];
    return result.error.issues.flatMap((issue): FormProblem<string>[] => {
        const [, index, field] = issue.path;
        if (typeof index === "number" && isStopField(field)) {
            const message = stopMessage(field, issue.message, index);
            const stop = entries.stops[index];
            return message && stop ? [{ field: stopFieldId(stop.key, field), message }] : [];
        }
        const text = pick(LANE_COPY.errors.stops, issue.message);
        return text ? [{ message: fillTemplate(text, { max: String(POSTING.stops.max) }) }] : [];
    });
};

export const freightProblems = (entries: FreightEntries): FormProblem<string>[] => {
    const result = freightEntriesSchema.safeParse(entries);
    if (result.success) return [];
    const seen = new Set<string>();
    return result.error.issues.flatMap((issue): FormProblem<string>[] => {
        const [field] = issue.path;
        const message = isFreightField(field) ? freightMessage(field, issue.message) : null;
        if (!message || !isFreightField(field) || seen.has(field)) return [];
        seen.add(field);
        return [{ field: freightFieldId(field), message }];
    });
};
