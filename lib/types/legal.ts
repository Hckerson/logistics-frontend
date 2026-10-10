import type { LEGAL_DOCUMENTS } from "@/lib/legal/constants";

export type LegalDocumentKey = (typeof LEGAL_DOCUMENTS)[number];

export interface LegalClause {
    id: string;
    title: string;
    body: readonly string[];
}

export interface SubProcessor {
    name: string;
    purpose: string;
    data: string;
    location: string;
}

export interface LegalVersion {
    version: string;
    effective: string;
    changes: readonly string[];
    clauses: readonly LegalClause[];
}

export interface LegalDocument {
    key: LegalDocumentKey;
    title: string;
    summary: string;
    versions: readonly LegalVersion[];
    subProcessors?: readonly SubProcessor[];
}

export interface LegalEdition {
    document: LegalDocument;
    edition: LegalVersion;
    current: LegalVersion;
    replacedBy: LegalVersion | null;
}
