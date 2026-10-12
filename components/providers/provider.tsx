"use client";
import { useState } from "react";
import { MotionConfig } from "motion/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnnouncerProvider from "@/components/providers/announcer-provider";
import { readRetryDelays } from "@/lib/utils/action-result";

export default function Provider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failures, error) => failures < readRetryDelays(error).length,
                        retryDelay: (failures, error) => readRetryDelays(error)[failures] ?? 0,
                    },
                    mutations: { retry: false },
                },
            }),
    );

    return (
        <MotionConfig reducedMotion="user">
            <QueryClientProvider client={queryClient}>
                <AnnouncerProvider>{children}</AnnouncerProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </MotionConfig>
    );
}
