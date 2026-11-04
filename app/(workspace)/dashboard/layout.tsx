import type { ReactNode } from "react";
import SystemColumn from "@/components/auth/system-column";
import { SYSTEM_PLACEMENT } from "@/lib/auth/constants";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <SystemColumn className={SYSTEM_PLACEMENT.workspace}>{children}</SystemColumn>;
}
