import { internalPath } from "@/lib/utils/internal-path";

export const BACK_PARAM = "back";

export const backTo = (candidate: string | null | undefined, base: string) => {
    const path = internalPath(candidate ?? undefined, "");
    return path === base || path.startsWith(`${base}?`) ? path : base;
};

export const withBack = (href: string, back: string | null) => {
    if (!back) return href;
    const [path, search = ""] = href.split("?");
    const params = new URLSearchParams(search);
    params.set(BACK_PARAM, back);
    return `${path}?${params.toString()}`;
};

export const backParam = (search: Record<string, string | string[] | undefined>) => {
    const value = search[BACK_PARAM];
    return Array.isArray(value) ? value[0] : (value ?? null);
};
