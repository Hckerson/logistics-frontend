import type { ReactNode } from "react";
import AuthFrame from "@/components/auth/auth-frame";
import LaneScene from "@/components/auth/lane-scene";

interface Props {
    children: ReactNode;
}

export default function AuthShell({ children }: Props) {
    return <AuthFrame scene={<LaneScene />}>{children}</AuthFrame>;
}
