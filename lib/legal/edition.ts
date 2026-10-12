import type { ClauseRevision, LegalDocumentKey, LegalEdition, LegalVersion } from "@/lib/types";
import { LEGAL_LIBRARY } from "@/lib/data/legal/library";
import { LEGAL_DATE, LEGAL_DOCUMENTS, LEGAL_LOCALE } from "@/lib/legal/constants";

const dates = new Intl.DateTimeFormat(LEGAL_LOCALE, LEGAL_DATE);

export const legalDate = (iso: string) => dates.format(new Date(iso));

const revisions = (edition: LegalVersion, previous: LegalVersion | undefined): Record<string, ClauseRevision> => {
    if (!previous) return {};
    const before = new Map(previous.clauses.map((clause): [string, string] => [clause.id, clause.body.join(" ")]));
    return Object.fromEntries(
        edition.clauses.flatMap((clause): [string, ClauseRevision][] => {
            const earlier = before.get(clause.id);
            if (earlier === undefined) return [[clause.id, "new"]];
            return earlier === clause.body.join(" ") ? [] : [[clause.id, "changed"]];
        }),
    );
};

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
        revised: revisions(document.versions[index], document.versions[index + 1]),
    };
}

export const legalParams = () =>
    LEGAL_DOCUMENTS.flatMap((document) => [
        { document },
        ...LEGAL_LIBRARY[document].versions.slice(1).map(({ version }) => ({ document, version: [version] })),
    ]);
