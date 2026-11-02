import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const loadIndex = async () => (await import("@/lib/help/search")).searchHelp;

export function useHelpSearch(query: string, active: boolean) {
    const { data: search, isSuccess, isError } = useQuery({
        queryKey: ["help", "index"],
        queryFn: loadIndex,
        enabled: active,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const results = useMemo(() => search?.(query) ?? [], [search, query]);

    return { results, ready: isSuccess, failed: isError };
}
