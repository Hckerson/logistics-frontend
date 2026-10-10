import { HOME_ROUTE } from "@/lib/constants";

export const internalPath = (candidate: string | undefined, fallback: string = HOME_ROUTE): string =>
    candidate?.startsWith("/") && !candidate.startsWith("//")
        ? candidate
        : fallback;
