import { isDeepStrictEqual } from "node:util";
import type { OpenApiDocument } from "./openapi-document";

export interface MergedContract {
    document: OpenApiDocument;
    published: string[];
}

export const mergePending = (
    backend: OpenApiDocument,
    pending: OpenApiDocument,
): MergedContract => {
    const backendSchemas = backend.components?.schemas ?? {};
    const pendingSchemas = pending.components?.schemas ?? {};
    const paths = { ...backend.paths };

    const publishedSchemas = Object.entries(pendingSchemas)
        .filter(([name, schema]) =>
            isDeepStrictEqual(backendSchemas[name], schema),
        )
        .map(([name]) => `schema ${name}`);

    const publishedOperations = Object.entries(pending.paths).flatMap(
        ([path, operations]) =>
            Object.entries(operations)
                .filter(([method, operation]) =>
                    isDeepStrictEqual(backend.paths[path]?.[method], operation),
                )
                .map(([method]) => `${method.toUpperCase()} ${path}`),
    );

    for (const [path, operations] of Object.entries(pending.paths)) {
        paths[path] = { ...paths[path], ...operations };
    }

    return {
        document: {
            paths,
            components: { schemas: { ...backendSchemas, ...pendingSchemas } },
        },
        published: [...publishedOperations, ...publishedSchemas],
    };
};
