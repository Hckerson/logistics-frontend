"use client";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import ProgressLine from "@/components/common/progress-line";
import SectionFailure from "@/components/common/section-failure";
import { LOADING_ANNOUNCE_MS, LOADING_SLOW_MS, SECTION_COPY } from "@/lib/errors/constants";
import { useSlow } from "@/lib/hooks/use-slow";
import { failureFrom } from "@/lib/utils/action-result";

interface Props<T> {
    label: string;
    query: UseQueryResult<T>;
    isEmpty?: (data: T) => boolean;
    empty?: ReactNode;
    children: (data: T) => ReactNode;
}

export default function SectionState<T>({ label, query, isEmpty, empty, children }: Props<T>) {
    const announced = useSlow(query.isPending, LOADING_ANNOUNCE_MS);
    const slow = useSlow(query.isPending, LOADING_SLOW_MS);

    if (query.isPending) {
        return (
            <div className="flex flex-col gap-2">
                <ProgressLine className="bg-border" />
                <p aria-live="polite" className="text-text-muted text-xs empty:hidden">
                    {slow ? SECTION_COPY.slow.replace("{label}", label) : announced ? SECTION_COPY.loading.replace("{label}", label) : ""}
                </p>
            </div>
        );
    }

    if (query.isError) return <SectionFailure label={label} failure={failureFrom(query.error)} onRetry={() => query.refetch()} />;

    return isEmpty?.(query.data) ? empty : children(query.data);
}
