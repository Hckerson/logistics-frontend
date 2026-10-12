import type { MockHandler, MockParams } from "@/lib/types";

const PARAM_PREFIX = ":";

const segmentsOf = (path: string) => path.split("/").filter(Boolean);

const paramsOf = (pattern: string, path: string): MockParams | null => {
    const expected = segmentsOf(pattern);
    const actual = segmentsOf(path);
    if (expected.length !== actual.length) return null;

    const params: MockParams = {};
    for (const [index, segment] of expected.entries()) {
        if (segment.startsWith(PARAM_PREFIX)) params[segment.slice(PARAM_PREFIX.length)] = decodeURIComponent(actual[index]);
        else if (segment !== actual[index]) return null;
    }
    return params;
};

export const resolveRoute = (handlers: Record<string, MockHandler>, method: string, path: string) => {
    const exact = handlers[`${method} ${path}`];
    if (exact) return { handler: exact, params: {} };

    for (const [key, handler] of Object.entries(handlers)) {
        const [verb, pattern] = key.split(" ");
        const params = verb === method && pattern.includes(PARAM_PREFIX) ? paramsOf(pattern, path) : null;
        if (params) return { handler, params };
    }
    return null;
};
