import { HOME_ROUTE } from "@/lib/constants";

export const internalPath = (candidate: string | undefined): string =>
    candidate?.startsWith("/") && !candidate.startsWith("//")
        ? candidate
        : HOME_ROUTE;
