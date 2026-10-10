import type { LegalClause } from "@/lib/types";

interface Revision {
    drop?: readonly string[];
    replace?: Readonly<Record<string, readonly string[]>>;
}

export const revise = (clauses: readonly LegalClause[], { drop = [], replace = {} }: Revision): LegalClause[] =>
    clauses
        .filter((clause) => !drop.includes(clause.id))
        .map((clause) => ({ ...clause, body: replace[clause.id] ?? clause.body }));
