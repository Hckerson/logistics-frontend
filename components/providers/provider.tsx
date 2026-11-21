"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { MotionConfig } from "motion/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnnouncerProvider from "@/components/providers/announcer-provider";
import { readRetryDelays } from "@/lib/utils/action-result";
import { reportUnexpected } from "@/lib/utils/report-error";

export default function Provider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({ onError: reportUnexpected }),
                mutationCache: new MutationCache({ onError: reportUnexpected }),
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
        <RouterProvider navigate={router.push}>
            <MotionConfig reducedMotion="user">
                <QueryClientProvider client={queryClient}>
                    <AnnouncerProvider>{children}</AnnouncerProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </MotionConfig>
        </RouterProvider>
    );
}
