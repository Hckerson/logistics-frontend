import type { ReactNode } from "react";
import AuthShell from "@/components/auth/auth-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <AuthShell>{children}</AuthShell>;
}
