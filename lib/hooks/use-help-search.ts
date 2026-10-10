import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const loadIndex = async () => (await import("@/lib/help/search")).searchHelp;

export function useHelpSearch(query: string, active: boolean) {
    const index = useQuery({
        queryKey: ["help", "index"],
        queryFn: loadIndex,
        enabled: active,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const results = useMemo(() => index.data?.(query) ?? [], [index.data, query]);

    return { results, ready: index.isSuccess, failed: index.isError };
}
