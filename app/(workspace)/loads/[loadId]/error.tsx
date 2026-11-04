"use client";
import ServerError from "@/components/auth/server-error";
import SystemColumn from "@/components/auth/system-column";
import { SYSTEM_PLACEMENT } from "@/lib/auth/constants";
import type { RouteError } from "@/lib/types";

export default function LoadError({ error, unstable_retry }: RouteError) {
    return (
        <SystemColumn className={SYSTEM_PLACEMENT.workspace}>
            <ServerError digest={error.digest} retry={unstable_retry} />
        </SystemColumn>
    );
}
