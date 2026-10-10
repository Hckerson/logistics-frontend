import type { LegalDocumentKey, LegalEdition } from "@/lib/types";
import { LEGAL_LIBRARY } from "@/lib/data/legal/library";
import { LEGAL_DATE, LEGAL_DOCUMENTS, LEGAL_LOCALE } from "@/lib/legal/constants";

const dates = new Intl.DateTimeFormat(LEGAL_LOCALE, LEGAL_DATE);

export const legalDate = (iso: string) => dates.format(new Date(iso));

const isDocument = (key: string): key is LegalDocumentKey => LEGAL_DOCUMENTS.some((document) => document === key);

export function findEdition(key: string, version?: readonly string[]): LegalEdition | null {
    if (!isDocument(key) || (version && version.length !== 1)) return null;
    const document = LEGAL_LIBRARY[key];
    const index = version ? document.versions.findIndex((edition) => edition.version === version[0]) : 0;
    if (index < 0) return null;
    return {
        document,
        edition: document.versions[index],
        current: document.versions[0],
        replacedBy: index > 0 ? document.versions[index - 1] : null,
    };
}

export const legalParams = () =>
    LEGAL_DOCUMENTS.flatMap((document) => [
        { document },
        ...LEGAL_LIBRARY[document].versions.slice(1).map(({ version }) => ({ document, version: [version] })),
    ]);
