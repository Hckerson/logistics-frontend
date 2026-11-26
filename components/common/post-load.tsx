"use client";
import type { ComponentProps } from "react";
import PostLoadFlow from "@/components/common/post-load-flow";
import Skeleton from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export default function PostLoad(props: ComponentProps<typeof PostLoadFlow>) {
    return useHydrated() ? <PostLoadFlow {...props} /> : <Skeleton lines={6} className="max-w-4xl" />;
}
