import type { routes } from "@/lib/contract/routes";
import type {
    ImportBatchDto,
    ImportColumnDto,
    ImportOutcomeDto,
    ImportPricingDto,
    ImportProblemDto,
    ImportRowDto,
    ImportTenderDto,
    ImportUploadRequestDto,
} from "@/lib/contract/schemas";

export type ImportField = keyof ImportRowDto["values"];
export type ImportValues = ImportRowDto["values"];
export type ImportStatus = ImportBatchDto["status"];
export type ImportOutcome = ImportRowDto["outcome"] | "excluded";
export type ImportSplit = NonNullable<ImportRowDto["split"]>;
export type ImportStep = "upload" | "map" | "check" | "price" | "done";
export type ImportIssueCode = ImportRowDto["issues"][number]["code"];

export interface ImportFieldSpec {
    label: string;
    description: string;
    example: string;
}

export interface MockImportPhase {
    busy: ImportStatus;
    done: ImportStatus;
    startedAt: number;
    ms: number;
}

export interface MockImport extends Pick<ImportUploadRequestDto, "fileName" | "contentType" | "sizeBytes"> {
    id: string;
    organisation: string;
    userId: string;
    userName: string;
    createdAt: number;
    hash: string | null;
    phase: MockImportPhase;
    headers: string[];
    columns: ImportColumnDto[];
    raw: string[][];
    rows: ImportRowDto[];
    problem: ImportProblemDto | null;
    pricing: ImportPricingDto | null;
    outcome: ImportOutcomeDto | null;
    tender: ImportTenderDto | null;
    mappingSaved: boolean;
    completedAt: number | null;
    version: number;
}

export interface MockImportSample {
    reference: string;
    from: string;
    to: string;
    inDays: number;
    days: number;
    equipment: string;
    commodity: string;
    weight: string;
    extra?: Partial<ImportValues>;
}

export interface MockImportPlan {
    columns: "template" | readonly (readonly [string, ImportField | null])[];
    style: "name" | "city";
    rows: readonly MockImportSample[];
    duplicateStop?: string;
    repeat?: number;
    header?: boolean;
}

export type ImportRowsParams = NonNullable<Parameters<typeof routes.importsRows>[1]>;
