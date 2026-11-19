import { readSheet } from "read-excel-file/universal";
import type { ImportColumnDto, ImportProblemDto } from "@/lib/contract/schemas";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { MOCK_IMPORTS, MOCK_IMPORT_SYNONYMS } from "@/lib/data/mocks/imports";
import { IMPORT_FIELDS, IMPORT_RULES, squash } from "@/lib/loads/imports";
import type { ImportField } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

type Saved = ReadonlyMap<string, ImportField> | undefined;

const ZIP = [0x50, 0x4b, 0x03, 0x04];
const SAMPLE_ROWS = 3;

const filled = (row: readonly string[]) => row.some((value) => value.trim() !== "");

const csvRows = (text: string) => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (quoted && char === '"' && text[index + 1] === '"') {
            cell += char;
            index += 1;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (!quoted && char === ",") {
            row.push(cell);
            cell = "";
        } else if (!quoted && (char === "\n" || char === "\r")) {
            if (char === "\r" && text[index + 1] === "\n") index += 1;
            rows.push([...row, cell]);
            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }
    return [...rows, [...row, cell]].filter(filled);
};

const cellText = (cell: unknown) => {
    if (cell instanceof Date) return cell.toISOString().slice(0, 10);
    return cell === null || cell === undefined ? "" : String(cell);
};

const tableOf = async (bytes: Uint8Array): Promise<string[][] | ImportProblemDto["code"]> => {
    if (ZIP.every((byte, index) => bytes[index] === byte)) {
        try {
            return (await readSheet(new Uint8Array(bytes).buffer)).map((row) => row.map(cellText)).filter(filled);
        } catch {
            return "unreadable";
        }
    }
    try {
        return csvRows(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch {
        return "encoding";
    }
};

const detect = (header: string, saved: Saved): ImportField | null => {
    const key = squash(header);
    return saved?.get(key) ?? IMPORT_FIELDS.find((field) => MOCK_IMPORT_SYNONYMS[field].includes(key) || squash(IMPORT_FIELD_SPECS[field].label) === key) ?? null;
};

const problem = (code: ImportProblemDto["code"], count = 0): { problem: ImportProblemDto } => ({
    problem: { code, message: fillTemplate(MOCK_IMPORTS.problems[code], { count: String(count) }) },
});

export const parseFile = async (bytes: Uint8Array, saved: Saved) => {
    const table = await tableOf(bytes);
    if (typeof table === "string") return problem(table);
    const [headers = [], ...raw] = table;
    if (!headers.some((header) => detect(header, saved))) return problem("noHeader");
    if (raw.length === 0) return problem("empty");
    if (raw.length > IMPORT_RULES.maxRows) return problem("tooManyRows", raw.length);
    return { headers: headers.map((header) => header.trim()), raw: raw.map((row) => headers.map((_, index) => (row[index] ?? "").trim())) };
};

export const proposeColumns = (headers: readonly string[], raw: readonly string[][], saved: Saved): ImportColumnDto[] => {
    const taken = new Set<ImportField>();
    return headers.map((header, index) => {
        const found = detect(header, saved);
        const field = found && !taken.has(found) ? found : null;
        if (field) taken.add(field);
        const source = field === null ? "none" : saved?.get(squash(header)) === field ? "saved" : "detected";
        const samples = raw.slice(0, SAMPLE_ROWS).flatMap((row) => (row[index] ? [row[index]] : []));
        return { index, header, samples, field, source };
    });
};

export const fileHash = (bytes: Uint8Array) => bytes.reduce((hash, byte) => Math.imul(hash ^ byte, 16_777_619) >>> 0, 2_166_136_261).toString(16);
