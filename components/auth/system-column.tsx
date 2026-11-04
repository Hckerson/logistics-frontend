import clsx from "clsx";
import type { ReactNode } from "react";
import AuthSignalProvider from "@/components/providers/auth-signal-provider";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { ENTRY_TIMELINE } from "@/lib/auth/entry";

interface Props {
    className?: string;
    children: ReactNode;
}

export default function SystemColumn({ className, children }: Props) {
    return (
        <div style={ENTRY_TIMELINE} className={clsx("haulr-shell grid items-center gap-y-8", AUTH_COLUMNS, className)}>
            <AuthSignalProvider>{children}</AuthSignalProvider>
        </div>
    );
}
